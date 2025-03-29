import jwt from 'jsonwebtoken';
import { getEnvVar } from './getEnvVar.js';

const JWT_SECRET = getEnvVar('JWT_SECRET');

export const generateResetToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });
};

export const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
      console.log(error);
    return null;
  }
};