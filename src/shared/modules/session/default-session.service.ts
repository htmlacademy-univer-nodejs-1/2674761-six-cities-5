import {inject, injectable} from 'inversify';
import {Logger} from '../../libs/logger/index.js';
import {Component} from '../../types/index.js';
import {SessionService} from './session-service.interface.js';
import {UserEntity} from '../user/index.js';
import * as crypto from 'node:crypto';
import {SignJWT} from 'jose';
import {LoginUserDto} from '../user/dto/login-user.dto.js';
import {UserService} from '../user/user-service.interface.js';
import {Config, SixCitiesAppSchema} from '../../libs/config/index.js';
import { UserNotFoundException } from './errors/user-not-found.js';
import { UserPasswordIncorrectException } from './errors/user-password.js';
import { JWT_ALGORITHM, JWT_EXPIRED } from './sesssion.constans.js';
import { TokenPayload } from './types/TokenPayload.js';

@injectable()
export class DefaultSessionService implements SessionService {

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly config: Config<SixCitiesAppSchema>,
  ) {
  }

  public async authenticate(user: UserEntity): Promise<string> {
    const jwtSecret = this.config.get('JWT_SECRET');
    const secretKey = crypto.createSecretKey(jwtSecret, 'utf-8');
    const tokenPayload: TokenPayload = {
      email: user.email,
      firstname: user.firstname,
      id: user.id,
    };

    this.logger.info(`Create token for ${user.email}`);
    return new SignJWT(tokenPayload)
      .setProtectedHeader({alg: JWT_ALGORITHM})
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRED)
      .sign(secretKey);
  }

  public async verify(dto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(`User with ${dto.email} not found`);
      throw new UserNotFoundException();
    }

    if (!user.verifyPassword(dto.password, this.config.get('SALT'))) {
      this.logger.warn(`Incorrect password for ${dto.email}`);
      throw new UserPasswordIncorrectException();
    }

    return user;
  }
}
