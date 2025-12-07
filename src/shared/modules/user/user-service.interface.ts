import {DocumentType} from '@typegoose/typegoose';
import {CreateUserDto} from './dto/create-user.dto.js';
import {UserEntity} from './user.entity.js';
import {RentOfferEntity} from '../rent-offer/index.js';

export interface UserService {
  create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;

  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;

  findById(id: string): Promise<DocumentType<UserEntity> | null>;

  findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>>;

  findFavoriteOffers(userId: string): Promise<DocumentType<RentOfferEntity>[]>;
}
