import {TokenPayload} from './src/shared/modules/session';

declare module 'express-serve-static-core' {

  export interface Request {
    tokenPayload: TokenPayload;
  }
}
