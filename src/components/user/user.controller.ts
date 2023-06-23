/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import User from './model/user.schema';
import MongoRepository from '../../repository/global-mongo.repository';
import IUser from './model/user.interface';
import catchAsync from '../../utils/catch-async.helper';
import { log } from 'winston';
import { AuthenticatedRequest } from './model/authenticated-request.interface';

class UsersController {
  private readonly userRepository: MongoRepository<IUser>;
  constructor() {
    this.userRepository = new MongoRepository(User);
  }

  public create = catchAsync(async (req: Request, res: Response) => {
    const newUser = await this.userRepository.create(req.body);
    res.send(newUser);
  });

  public admin = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    console.log(req.user);

    res.send('Admin panel');
  });
}

export default UsersController;
