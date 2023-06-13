import { Document } from 'mongoose';
import UserRoles from './UserRoles';
export default interface IUser extends Document {
  name: string;
  email: string;
  photo: string;
  role: UserRoles;
  isEmailVerified: boolean;
  password: string | undefined;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  changedPasswordAfter: any;
  correctPassword: any;
  active: boolean;
  createPasswordResetToken: any;
}
