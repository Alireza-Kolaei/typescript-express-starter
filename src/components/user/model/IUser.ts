import UserRoles from './UserRoles';
export default interface IUser {
  name: string;
  email: string;
  photo?: string ;
  role: UserRoles;
  isEmailVerified: boolean;
  password: string ;
  active: boolean;
  passwordChangedAt: Date;
  passwordResetToken?: string ;
  passwordResetExpires?: Date ;
  changedPasswordAfter(JWTTimestamp : number): boolean;
  correctPassword(candidatePassword: string): boolean;
  createPasswordResetToken(): string;
}
