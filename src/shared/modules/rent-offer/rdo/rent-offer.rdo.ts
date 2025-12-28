import {Expose, Type} from 'class-transformer';
import {HousingConveniences, HousingType} from '../../../types/index.js';
import {UserRdo} from '../../user/rdo/user.rdo.js';

export class RentOfferRdo {
  @Expose()
  public title: string;

  @Expose()
  public description: string;

  @Expose()
  public createdDate: Date;

  @Expose()
  public city: string;

  @Expose()
  public previewImage: string;

  @Expose()
  public housingPhoto: string;

  @Expose()
  public isPremium: boolean;

  @Expose()
  public isFavorite: boolean;

  @Expose()
  public housingType: HousingType;

  @Expose()
  public roomsCount: number;

  @Expose()
  public guestsCount: number;

  @Expose()
  public price: number;

  @Expose()
  public conveniences: HousingConveniences[];

  @Expose({name: 'authorId'})
  @Type(() => UserRdo)
  public authorId: UserRdo;

  @Expose()
  public commentsCount: number;

  @Expose()
  public coordinates: string;

  @Expose()
  public rating: number;

}
