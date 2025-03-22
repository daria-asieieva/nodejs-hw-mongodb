import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { UserCollection } from '../db/models/User.js';
import { getEnvVar } from '../utils/getEnvVar.js';

const JWT_SECRET = getEnvVar('JWT_SECRET');

export const authenticate = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');
  
  if (bearer !== 'Bearer' || !token) {
    next(createError(401, 'Not authorized'));
    return;
  }
  
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await UserCollection.findById(id);
    
    if (!user) {
      next(createError(401, 'Not authorized'));
      return;
    }
    
    
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    req.user = userWithoutPassword;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(createError(401, 'Access token expired'));
    } else {
      next(createError(401, 'Not authorized'));
    }
  }
};