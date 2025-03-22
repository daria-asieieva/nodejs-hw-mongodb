import bcrypt from 'bcrypt';
import createError from 'http-errors';
import { UserCollection } from '../db/models/User.js';
import { SessionCollection } from '../db/models/Session.js';
import crypto from 'crypto';


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