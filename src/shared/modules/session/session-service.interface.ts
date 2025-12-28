import {UserEntity} from '../user/index.js';
import {LoginUserDto} from '../user/dto/login-user.dto.js';

export interface SessionService {
  authenticate(user: UserEntity): Promise<string>;

  verify(dto: LoginUserDto): Promise<UserEntity>;
}
