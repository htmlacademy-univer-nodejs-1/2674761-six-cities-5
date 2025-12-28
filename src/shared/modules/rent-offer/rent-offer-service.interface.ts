import {DocumentType, types} from '@typegoose/typegoose';
import {CreateRentOfferDto} from './dto/create-rent-offer.dto.js';
import {PatchRentOfferDto} from './dto/patch-rent-offer.dto.js';
import {RentOfferEntity} from './rent-offer.entity.js';
import {DocumentExists} from '../../types/index.js';

export interface RentOfferService extends DocumentExists {
  create(dto: CreateRentOfferDto): Promise<DocumentType<RentOfferEntity>>;

  findById(id: string): Promise<DocumentType<RentOfferEntity> | null>;

  find(limit?: number): Promise<DocumentType<RentOfferEntity>[]>;

  delete(id: string): Promise<types.DocumentType<RentOfferEntity> | null>;

  findPremiumByCity(city: string): Promise<types.DocumentType<RentOfferEntity>[]>;

  patch(rentOfferId: string, dto: PatchRentOfferDto): Promise<types.DocumentType<RentOfferEntity> | null>;

  calculateRating(oldRating: number, newRating: number, ratingsCount: number, offerId: string): Promise<void>;

  addComment(rentOfferId: string, rating: number): Promise<DocumentType<RentOfferEntity> | null>;

  exists(documentId: string): Promise<boolean>;
}
