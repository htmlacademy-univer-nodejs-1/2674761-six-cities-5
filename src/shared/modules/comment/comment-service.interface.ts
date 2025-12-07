import {DocumentType} from '@typegoose/typegoose';
import {CommentEntity} from './comment.entity.js';
import { CreateCommentDto } from './index.js';


export interface CommentService {
  create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>>;

  findByRentOfferId(rentOfferId: string): Promise<DocumentType<CommentEntity>[]>;
}
