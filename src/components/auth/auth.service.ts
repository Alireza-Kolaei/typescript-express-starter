import MongoRepository from '../../repository/global-mongo.repository';
import User from '../user/model/user.schema';
import IUser from '../user/model/user.interface';
import ApiError from '../../utils/api-error.helper';
import * as httpStatus from 'http-status';
import tokenTypes from '../token/token-types.enum';
import TokenService from '../../services/token.service';
import Token from '../token/token.schema';
import * as Joi from 'joi';
import IToken from '../token/token.interface';

export default class Auth {
  private userRepository: MongoRepository<IUser>;
  private tokenRepository: MongoRepository<IToken>;
  private tokenService: TokenService;
  constructor() {
    this.userRepository = new MongoRepository(User);
    this.tokenRepository = new MongoRepository(Token);
    this.tokenService = new TokenService();
    this.signup = this.signup.bind(this);
  }

  public async signup(credentials: Partial<IUser>) {
    const { name, password, email } = credentials;

    const schema = Joi.object({
      name: Joi.string().alphanum().min(3).max(30).required(),
      password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
      email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'ir'] } }),
    });

    const { value, error } = schema.validate({ name, email, password }, { abortEarly: false });

    if (error) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Registration Failed, Bad Credentials.');
    }

    const user = await this.userRepository.findOneByParams({ email });

    if (user && user.isEmailVerified) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User already exist.');
    }

    if (user && !user.isEmailVerified) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Please verify your email.');
    }

    const newUser = await this.userRepository.create(value);
    return newUser as IUser;
  }

  public async loginWithEmail(credentials: Partial<IUser>) {
    const { email, password } = credentials;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.correctPassword(password as string)) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }
    if (!user.isEmailVerified) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please verify your email.');
    }
    return user;
  }

  public async refreshAuth(refreshToken: string) {
    const refreshTokenDoc = await this.tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await this.userRepository.findByID(`${refreshTokenDoc.user}`);
    if (!user) {
      throw new Error('User Not found');
    }
    await refreshTokenDoc.remove();
    return this.tokenService.generateAuthTokens(user);
  }

  public async logout(refreshToken: string) {
    // const refteshtokendoc = await this.tokenRepositroy.findOneByParams({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false } ,['User'])
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
    if (!refreshTokenDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    await refreshTokenDoc.remove();
  }
}
