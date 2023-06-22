import IUser from '../components/user/model/IUser';
import * as Joi from 'joi';
import ApiError from './ApiError';
import httpStatus = require('http-status');

const validateSignup = async (credentials: Partial<IUser>) => {
  try {
    const { name, email, password } = credentials;
    const schema = Joi.object({
      name: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
      email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'ir'] } }),
    });
    return await schema.validateAsync({ name, password, email });
    
    
  } catch (error) {
   throw new ApiError(httpStatus.BAD_REQUEST , 'Bad Request')
  }
};

export { validateSignup };
