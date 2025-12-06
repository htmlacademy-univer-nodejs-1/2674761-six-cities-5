import {types} from '@typegoose/typegoose';
import {inject, injectable} from 'inversify';
import {Logger} from '../../libs/logger/index.js';
import {Component} from '../../types/index.js';
import {CreateRentOfferDto} from './dto/create-rent-offer.dto.js';
import {RentOfferService} from './rent-offer-service.interface.js';
import {RentOfferEntity} from './rent-offer.entity.js';

@injectable()
export class DefaultRentOfferService implements RentOfferService {

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.RentOfferModel) private readonly rentOfferModel: types.ModelType<RentOfferEntity>
  ) {
  }

  public async create(dto: CreateRentOfferDto): Promise<types.DocumentType<RentOfferEntity>> {
    this.logger.info(`Try created rent offer: ${dto.title}`);

    const result = await this.rentOfferModel.create(dto);
    this.logger.info(`New user created: ${dto.title}`);

    return result;
  }

  public async findById(id: string): Promise<types.DocumentType<RentOfferEntity> | null> {
    this.logger.info(`Try find rent offer with id=${id}`);
    const searchResult = await this.rentOfferModel.findById({id});
    if (searchResult) {
      this.logger.info(`Success find rent offer with id=${id}`);
    }

    return searchResult;
  }
}
