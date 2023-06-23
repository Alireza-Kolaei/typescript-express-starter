import { Application } from 'express';
import * as httpStatus from 'http-status';
import ApiError from '../../utils/api-error.helper';
import { errorHandler } from './error.middleware';
export default (app: Application) => {
  app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Requested Resource Was Not Found'));
  });
  app.use(errorHandler);
};
