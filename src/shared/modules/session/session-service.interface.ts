import {CreateSessionDto} from './dto/create-session.dto.js';

export interface SessionService {
  create(dto: CreateSessionDto): Promise<string>;

  existById(id: string): Promise<boolean>;

  deleteById(id: string): Promise<void>
}
