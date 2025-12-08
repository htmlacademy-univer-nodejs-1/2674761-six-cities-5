import {BaseUserException} from './base-user.exception.js';
import {StatusCodes} from 'http-status-codes';

export class UserNotFoundException extends BaseUserException {
  constructor() {
    super(StatusCodes.NOT_FOUND, 'User not found');
  }
}
