import {types} from '@typegoose/typegoose';
import {Container} from 'inversify';
import {Component} from '../../types/index.js';
import {DefaultRentOfferService} from './default-rent-offer.service.js';
import {RentOfferService} from './rent-offer-service.interface.js';
import {RentOfferEntity, RentOfferModel} from './rent-offer.entity.js';

export function createRentOfferContainer() {
  const userContainer = new Container();
  userContainer.bind<RentOfferService>(Component.RentOfferService).to(DefaultRentOfferService).inSingletonScope();
  userContainer.bind<types.ModelType<RentOfferEntity>>(Component.RentOfferModel).toConstantValue(RentOfferModel);

  return userContainer;
}
