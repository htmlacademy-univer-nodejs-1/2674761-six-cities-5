import {Expose} from 'class-transformer';
import {HousingType} from '../../../types/index.js';

export class RentOfferResponseRdo {
  @Expose()
  public title: string;

  @Expose()
  public createdDate: Date;

  @Expose()
  public city: string;

  @Expose()
  public previewImage: string;

  @Expose()
  public isPremium: boolean;

  @Expose()
  public isFavorite: boolean;

  @Expose()
  public housingType: HousingType;

  @Expose()
  public rating: number;

  @Expose()
  public commentsCount: number;

  @Expose()
  public price: number;
}
