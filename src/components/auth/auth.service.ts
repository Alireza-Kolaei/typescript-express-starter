import MongoRepository from '../../repository/mongo.repository';
import User from '../user/model/User';
import IUser from '../user/model/IUser';
import ApiError from '../../utils/ApiError';
import * as httpStatus from 'http-status';
import { validateSignup } from '../../utils/Validators';
import tokenTypes from '../../config/tokens';
import TokenService from '../../services/token.service';
import Token from '../token/token';

export default class Auth {
  private userRepository: MongoRepository<IUser>;
  private tokenService: TokenService;
  constructor() {
    this.userRepository = new MongoRepository(User);
    this.tokenService = new TokenService();
    this.signup = this.signup.bind(this);
  }

  public async signup(credentials: Partial<IUser>) {
    try {
      const validateResult = await validateSignup(credentials);
      if (!validateResult) return validateResult;
      const user = await this.userRepository.create(validateResult);
      return user;
      
    } catch (error) {
      console.log(error);
    }
  }

  public async loginWithEmail(credentials: Partial<IUser>) {
    const { email, password } = credentials;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !( user.correctPassword(password as string))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
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
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
    if (!refreshTokenDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    await refreshTokenDoc.remove();
  }
}
