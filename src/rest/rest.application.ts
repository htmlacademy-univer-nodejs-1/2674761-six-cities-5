import { Config } from 'convict';
import { inject, injectable } from 'inversify';
import { Logger } from 'pino';
import { Component } from '../shared/components.enum.js';
import { RestSchema } from '../shared/helpers/rest.schema.js';


@injectable()
export class RestApplication {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
  ) {}

  public async init() {
    this.logger.info('Application initialization');
    this.logger.info(`Get value from env $PORT: ${this.config.get('PORT')}`);
  }
}
