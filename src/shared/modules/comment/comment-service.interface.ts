import {DocumentType} from '@typegoose/typegoose';
import {CommentEntity} from './comment.entity.js';
import {CreateCommentDto} from './dto/create-comment.dto.js';

export interface CommentService {
  create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>>;

  findByRentOfferId(rentOfferId: string): Promise<DocumentType<CommentEntity>[]>;

  deleteByRentOfferId(rentOfferId: string): Promise<number>;
}
