import { Router } from 'express';
import AuthMiddleware from '../../middlewares/auth.middleware';
const authMiddleware = new AuthMiddleware();
import UserController from './user.controller';
const userController = new UserController();

const userRouter = Router();

userRouter.post('/create', userController.create);
userRouter.get('/admin', authMiddleware.protect, userController.admin);

export default userRouter;
