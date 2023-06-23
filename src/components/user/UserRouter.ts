import { Router } from 'express';
// import AuthController from '@components/auth/controller';
// const authController = new AuthController();
// userRouter.post('/signup', authController.register);
import AuthMiddleware from '../../middlewares/auth';
const authMiddleware = new AuthMiddleware();
import UserController from './UserController';
const userController = new UserController();

const userRouter = Router();

userRouter.post('/create', userController.create);
userRouter.get('/admin', authMiddleware.protect, userController.admin);

export default userRouter;
