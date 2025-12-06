import {UserType} from '../../../types/index.js';

export class CreateUserDto {
  public firstname: string;
  public email: string;
  public avatarPath: string;
  public type: UserType;
  public password: string;
}
