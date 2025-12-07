import {Coordinates, HousingConveniences, HousingType} from '../../../types/index.js';

export class PatchRentOfferDto {
  title: string;
  description: string;
  createdDate: Date;
  city: string;
  previewImage: string;
  housingPhoto: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  housingType: HousingType;
  roomsCount: number;
  guestsCount: number;
  price: number;
  conveniences: HousingConveniences[];
  authorId: string;
  commentsCount: number;
  coordinates: Coordinates;
}
