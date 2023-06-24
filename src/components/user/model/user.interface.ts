import UserRoles from './user-roles.enum';
import { Document } from 'mongoose';

export default interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  photo?: string;
  role: UserRoles;
  isEmailVerified: boolean;
  password: string;
  active: boolean;
  passwordChangedAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  correctPassword(candidatePassword: string): boolean;
  createPasswordResetToken(): string;
}
