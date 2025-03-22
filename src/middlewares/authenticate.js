import createError from 'http-errors';
import { UserCollection } from '../db/models/User.js';
import { SessionCollection } from '../db/models/Session.js';

export const authenticate = async (req, res, next) => {
  const { authorization = '' } = req.headers;
  
 
  if (!authorization) {
    next(createError(401, 'Not authorized'));
    return;
  }
  
  
  if (authorization.startsWith('Basic ')) {
    const base64Credentials = authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email] = credentials.split(':');
    
    try {
      
      const user = await UserCollection.findOne({ email });
      
      if (!user) {
        next(createError(401, 'Not authorized'));
        return;
      }
      
      
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      req.user = userWithoutPassword;
      
      next();
    } catch (error) {
      console.log(error);
      next(createError(401, 'Not authorized'));
    }
    return;
  }
  
  
  if (authorization.startsWith('Bearer ')) {
    const token = authorization.split(' ')[1];
    
    if (!token) {
      next(createError(401, 'Not authorized'));
      return;
    }
    
    try {
     
      const session = await SessionCollection.findOne({ accessToken: token });
      
      if (!session) {
        next(createError(401, 'Not authorized'));
        return;
      }
      
     
      if (new Date() > new Date(session.accessTokenValidUntil)) {
        next(createError(401, 'Access token expired'));
        return;
      }
      
     
      const user = await UserCollection.findById(session.userId);
      
      if (!user) {
        next(createError(401, 'Not authorized'));
        return;
      }
      
      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;
      req.user = userWithoutPassword;
      
      next();
    } catch (error) {
      console.log(error);
      next(createError(401, 'Not authorized'));
    }
    return;
  }
  
  next(createError(401, 'Not authorized'));
};