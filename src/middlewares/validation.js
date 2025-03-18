import { isValidObjectId } from 'mongoose';
import createError from 'http-errors';

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      next(createError(400, errorMessages));
      return;
    }
    
    next();
  };
};

export const isValidId = (req, res, next) => {
  const { contactId } = req.params;
  
  if (!isValidObjectId(contactId)) {
    next(createError(400, `Невірний формат ID контакту: ${contactId}`));
    return;
  }
  
  next();
};