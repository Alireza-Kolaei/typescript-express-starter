import { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import { Error as mongooseError } from 'mongoose';
import { MongoError } from 'mongodb';
import ApiError from '../../utils/api-error.helper';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const handleCastErrorDB = (err: mongooseError.CastError) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ApiError(400, message);
};

const handleDuplicateFieldsDB = (err: MongoError) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const value = err.message.match(/(["'])(\\?.)*?\1/)![0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(400, message);
};

const handleValidationErrorDB = (err: mongooseError.ValidationError) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ApiError(400, message);
};

const handleJWTError = () => new ApiError(401, 'Please log in again!');

const sendErrorDev = (err: any, req: Request, res: Response) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: ApiError, req: Request, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  return res.status(500).json({
    success: false,
    message: 'Something went very wrong!',
  });
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  // console.log(err);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err instanceof mongooseError.CastError) error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (error instanceof mongooseError.ValidationError) error = handleValidationErrorDB(err);
    if (err instanceof JsonWebTokenError) error = handleJWTError();
    if (err.name == 'TokenExpiredError') error = handleJWTError();

    sendErrorProd(error, req, res);
  }
};
export { errorHandler };
