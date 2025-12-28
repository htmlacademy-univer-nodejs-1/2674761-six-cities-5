import {Coordinates} from './coordinates.type.js';
import {HousingConveniences} from './housing-conveniences.enum.js';
import {HousingType} from './housing-type.enum.js';
import {User} from './user.type.js';

export type RentOffer = {
  title: string,
  description: string,
  createdDate: Date,
  city: string,
  previewImage: string,
  housingPhoto: string[],
  isPremium: boolean,
  rating: number,
  housingType: HousingType,
  roomsCount: number,
  guestsCount: number,
  price: number,
  conveniences: HousingConveniences[],
  author: User,
  commentsCount: number,
  coordinates: Coordinates
}
