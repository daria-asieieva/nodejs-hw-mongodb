import bcrypt from 'bcrypt';
import createError from 'http-errors';
import { UserCollection } from '../db/models/User.js';
import { SessionCollection } from '../db/models/Session.js';
import crypto from 'crypto';
import { generateResetToken, verifyResetToken } from '../utils/jwtUtils.js';
import { sendResetPasswordEmail } from '../utils/emailService.js';
import { getEnvVar } from '../utils/getEnvVar.js';

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const register = async (userData) => {
  const { email } = userData;
  
  const existingUser = await UserCollection.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email in use');
  }
  
  const newUser = await UserCollection.create(userData);
  
  const userResponse = newUser.toObject();
  delete userResponse.password;
  
  return userResponse;
};

export const login = async (loginData) => {
  const { email, password } = loginData;
  
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createError(401, 'Email or password is wrong');
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError(401, 'Email or password is wrong');
  }
  
  await SessionCollection.deleteMany({ userId: user._id.toString() });
  
  const accessToken = generateToken();
  const refreshToken = generateToken();
  
  const now = new Date();
  const accessTokenValidUntil = new Date(now.getTime() + 15 * 60 * 1000); // 15 хвилин
  const refreshTokenValidUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 днів
  
  await SessionCollection.create({
    userId: user._id.toString(),
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });
  
  return { accessToken, refreshToken };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw createError(401, 'No refresh token provided');
  }
  
  const session = await SessionCollection.findOne({ refreshToken });
  if (!session) {
    throw createError(401, 'Invalid refresh token');
  }
  
  if (new Date() > new Date(session.refreshTokenValidUntil)) {
    throw createError(401, 'Refresh token expired');
  }
  
  await SessionCollection.deleteOne({ _id: session._id });
  
  const newAccessToken = generateToken();
  const newRefreshToken = generateToken();
  
  const now = new Date();
  const accessTokenValidUntil = new Date(now.getTime() + 15 * 60 * 1000); 
  const refreshTokenValidUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); 
  
  await SessionCollection.create({
    userId: session.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });
  
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) {
    throw createError(401, 'No refresh token provided');
  }
  
  const session = await SessionCollection.findOne({ refreshToken });
  if (!session) {
    throw createError(401, 'Invalid refresh token');
  }
  
  await SessionCollection.deleteOne({ _id: session._id });
  
  return true;
};

export const sendResetEmail = async (email) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createError(404, 'User not found!');
  }
  
  const resetToken = generateResetToken(email);
  const appDomain = getEnvVar('APP_DOMAIN');
  const resetLink = `${appDomain}/reset-password?token=${resetToken}`;
  
  try {
    await sendResetPasswordEmail(email, resetLink);
    return true;
  } catch (error) {
    console.error('Failed to send reset email:', error);
    throw createError(500, 'Failed to send the email, please try again later.');
  }
};

export const resetPassword = async (token, newPassword) => {
  const payload = verifyResetToken(token);
  
  if (!payload) {
    throw createError(401, 'Token is expired or invalid.');
  }
  
  const { email } = payload;
  const user = await UserCollection.findOne({ email });
  
  if (!user) {
    throw createError(404, 'User not found!');
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  
  await UserCollection.findByIdAndUpdate(user._id, { password: hashedPassword });
  
  
  await SessionCollection.deleteMany({ userId: user._id.toString() });
  
  return true;
};