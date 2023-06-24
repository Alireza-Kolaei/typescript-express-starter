import { Request } from 'express';
import UserRoles from './user-roles.enum';

export interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRoles;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
  };
}
