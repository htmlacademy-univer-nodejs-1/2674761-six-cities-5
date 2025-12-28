import {Container} from 'inversify';
import {Component} from '../../types/index.js';
import {DefaultSessionService} from './default-session.service.js';
import {SessionService} from './session-service.interface.js';
import {SessionExceptionFilter} from './session.exception.js';
import {ExceptionFilter} from '../../libs/rest/index.js';

export function createSessionContainer() {
  const sessionContainer = new Container();
  sessionContainer.bind<SessionService>(Component.SessionService).to(DefaultSessionService).inSingletonScope();
  sessionContainer.bind<ExceptionFilter>(Component.SessionExceptionFilter).to(SessionExceptionFilter).inSingletonScope();
  return sessionContainer;
}
