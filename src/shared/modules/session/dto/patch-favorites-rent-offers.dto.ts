import {IsMongoId} from 'class-validator';
import {PatchFavoritesRentOfferValidationMessage} from './patch-favorites-rent-offer.messages.js';

export class PatchFavoritesRentOffersDto {
  public authorId: string;

  @IsMongoId({message: PatchFavoritesRentOfferValidationMessage.rentOfferId.invalidId})
  public rentOfferId: string;
}
