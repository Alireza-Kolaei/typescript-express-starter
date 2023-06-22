/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import User from './model/User'
import MongoRepository from '../../repository/mongo.repository'
import IUser from './model/IUser'
import catchAsync from '../../utils/catchAsync'
import { log } from 'winston'
import { AuthenticatedRequest } from './model/IAuthenticatedRequest'


class UsersController {
  private readonly userRepository:MongoRepository<IUser>
  constructor () {
    this.userRepository = new MongoRepository(User)
    
  }


  public create = catchAsync( async (req: Request, res: Response) => {
    const newUser = await this.userRepository.create(req.body)
    res.send(newUser)
   })


   
  public admin = catchAsync( async (req: AuthenticatedRequest, res: Response) => {

    console.log(req.user);
    
    res.send('Admin panel')
   })

}
 
export default UsersController
