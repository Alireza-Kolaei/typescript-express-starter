import { Router } from 'express';
// import AuthController from '@components/auth/controller';
// const authController = new AuthController();
// userRouter.post('/signup', authController.register);
import AuthMiddleware from '../../middlewares/auth.middleware';
const authMiddleware = new AuthMiddleware();
import UserController from './user.controller';
const userController = new UserController();

const userRouter = Router();

userRouter.post('/create', userController.create);
userRouter.get('/admin', authMiddleware.protect, userController.admin);

export default userRouter;
