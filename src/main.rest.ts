import 'reflect-metadata';
import {Container} from 'inversify';
import { Component } from './shared/components.enum.js';
import { PinoLogger } from './shared/logger/pino.logger.js';
import RestConfig from './shared/helpers/rest.config.js';
import {Config} from './shared/helpers/config.interface.js';
import { Logger } from './shared/logger/logger.interface.js';
import { RestSchema } from './shared/helpers/rest.schema.js';
import {RestApplication} from './rest/rest.application.js';


async function bootstrap() {
  const container = new Container();
  container.bind<RestApplication>(Component.RestApplication).to(RestApplication).inSingletonScope();
  container.bind<Logger>(Component.Logger).to(PinoLogger).inSingletonScope();
  container.bind<Config<RestSchema>>(Component.Config).to(RestConfig).inSingletonScope();
  const application = container.get<RestApplication>(Component.RestApplication);
  await application.init();
}

bootstrap();
