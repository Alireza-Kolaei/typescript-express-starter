import IUser from './IUser';
import { Schema, model } from 'mongoose';
import validator from 'validator';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import ApiError from '../../../utils/ApiError';
import httpStatus = require('http-status');
import UserRoles from './UserRoles';

const userSchema: Schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      trim: true,
      select: false,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true,
    },
    role: {
      type: String,
      enum: UserRoles,
      default: UserRoles.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

userSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    ret.id = ret._id;
    delete ret['password'];
    delete ret['__v'];
    delete ret['_id'];
    return ret;
  },
});

// userSchema.pre('save', function (next) {
//   if (this.password !== this.passwordConfirm) {
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'passwords does not match');
//   }
//   next();
// });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword: string) {
  if (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }
  return new ApiError(httpStatus.BAD_REQUEST , 'please provide your password')
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime();
    return JWTTimestamp * 1000 < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

export default model<IUser>('User', userSchema);
