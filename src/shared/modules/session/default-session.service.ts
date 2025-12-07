import {types} from '@typegoose/typegoose';
import {inject, injectable} from 'inversify';
import {Logger} from '../../libs/logger/index.js';
import {Component} from '../../types/index.js';
import {CreateSessionDto, SessionEntity} from './index.js';
import {SessionService} from './session-service.interface.js';

@injectable()
export class DefaultSessionService implements SessionService {

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.SessionModel) private readonly sessionModel: types.ModelType<SessionEntity>
  ) {
  }

  public async create(dto: CreateSessionDto): Promise<string> {
    this.logger.info(`Try created session for user=${dto.userId}`);
    const result = await this.sessionModel.create(dto);

    this.logger.info('New session created');

    return result.id;
  }

  public async existById(id: string): Promise<boolean> {
    this.logger.info(`Check exist session with id=${id.substring(0, 6)}***`);
    const isExist = (await this.sessionModel.exists({_id: id})) !== null;
    if (isExist) {
      this.logger.info('Session exist');
    } else {
      this.logger.info('Session not exist');
    }

    return isExist;
  }

  public async deleteById(id: string): Promise<void> {
    this.logger.info(`Delete session with id=${id.substring(0, 6)}***`);
    const result = await this.sessionModel.deleteOne({id});

    if (result) {
      this.logger.info('Session delete');
    }
  }
}
