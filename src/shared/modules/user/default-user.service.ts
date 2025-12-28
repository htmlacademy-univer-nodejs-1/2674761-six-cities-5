import {DocumentType, types} from '@typegoose/typegoose';
import {inject, injectable} from 'inversify';
import {Logger} from '../../libs/logger/index.js';
import {Component} from '../../types/index.js';
import {CreateUserDto} from './dto/create-user.dto.js';
import {UserService} from './user-service.interface.js';
import {UserEntity} from './user.entity.js';
import {RentOfferEntity} from '../rent-offer/index.js';

@injectable()
export class DefaultUserService implements UserService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.UserModel) private readonly userModel: types.ModelType<UserEntity>,
    @inject(Component.RentOfferModel) private readonly rentOfferModel: types.ModelType<RentOfferEntity>,
  ) {
  }

  public async create(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity(dto);
    user.setPassword(dto.password, salt);

    const result = await this.userModel.create(user);
    this.logger.info(`New user created: ${user.email}`);

    return result;
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({email});
  }

  public async findById(id: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findById(id);
  }

  public async findOrCreate(dto: CreateUserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const existedUser = await this.findByEmail(dto.email);

    if (existedUser) {
      return existedUser;
    }

    return this.create(dto, salt);
  }

  public async findFavoriteOffers(userId: string): Promise<DocumentType<RentOfferEntity>[]> {
    this.logger.info(`Try find favorites for user ${userId}`);

    const document = await this.userModel.findById(userId).select('favoriteOffers').exec();
    if (!document) {
      return [];
    }

    const rentOffers = await this.rentOfferModel.find({_id: {$in: document.favoriteOffers}});

    for (const rentOffer of rentOffers) {
      rentOffer.isFavorite = true;
    }

    return rentOffers;
  }

  public async addFavorite(offerId: string, userId: string): Promise<void> {
    await this.userModel.updateOne(
      {_id: userId},
      {$addToSet: {favoriteOffers: offerId}}
    );
  }

  public async deleteFavorite(offerId: string, userId: string): Promise<void> {
    await this.userModel.updateOne(
      {_id: userId},
      {$pull: {favoriteOffers: offerId}}
    );
  }
}
