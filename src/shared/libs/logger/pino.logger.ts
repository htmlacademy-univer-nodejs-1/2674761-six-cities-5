import {injectable} from 'inversify';
import {Logger as PinoInstance, pino} from 'pino';
import {Logger} from './logger.interface.js';

@injectable()
export class PinoLogger implements Logger {
  private readonly logger: PinoInstance;

  constructor() {
    this.logger = pino();
  }

  public debug(message: string, ...args: undefined[]): void {
    this.logger.debug(message, ...args);
  }

  public error(message: string, error: Error, ...args: undefined[]): void {
    this.logger.error(error, message, ...args);
  }

  public info(message: string, ...args: undefined[]): void {
    this.logger.info(message, ...args);
  }

  public warn(message: string, ...args: undefined[]): void {
    this.logger.warn(message, ...args);
  }
}
