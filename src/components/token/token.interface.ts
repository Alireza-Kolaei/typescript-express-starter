import { Document, Schema } from 'mongoose';
import tokenTypes from './token-types.enum';

export default interface IToken extends Document {
  token: string;
  user: Schema.Types.ObjectId;
  type: tokenTypes;
  expires: Date;
  blacklisted: boolean;
}
