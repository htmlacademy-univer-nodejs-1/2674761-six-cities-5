import {defaultClasses, getModelForClass, modelOptions, prop, Ref} from '@typegoose/typegoose';
import {Coordinates, HousingConveniences, HousingType} from '../../types/index.js';
import {UserEntity} from '../user/index.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface RentOfferEntity extends defaultClasses.Base {
}

@modelOptions({
  schemaOptions: {
    collection: 'rent-offers'
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class RentOfferEntity extends defaultClasses.TimeStamps {
  @prop({
    required: true,
    trim: true,
    minlength: [10, 'Min length of title is 1'],
    maxlength: [100, 'Max length of title is 15']
  })
    title: string;

  @prop({
    required: true,
    trim: true,
    minlength: [20, 'Min length of title is 1'],
    maxlength: [1024, 'Max length of title is 15']
  })
    description: string;

  @prop({
    required: true
  })
    createdDate: Date;

  @prop({
    required: true
  })
    city: string;

  @prop({
    required: true
  })
    previewImage: string;

  @prop({
    required: true
  })
    housingPhoto: string;

  @prop({
    required: true
  })
    isPremium: boolean;

  @prop({
    required: true
  })
    isFavorite: boolean;

  @prop({
    required: true,
    min: 1,
    max: 5
  })
    rating: number;

  @prop({
    required: true,
    type: () => String,
    enum: HousingType
  })
    housingType: HousingType;

  @prop({
    required: true,
    min: 1,
    max: 8
  })
    roomsCount: number;

  @prop({
    required: true,
    min: 1,
    max: 10
  })
    guestsCount: number;

  @prop({
    required: true,
    min: 100,
    max: 100000
  })
    price: number;

  @prop({
    required: true
  })
    conveniences: HousingConveniences[];

  @prop({
    required: true,
    ref: UserEntity,
  })
    authorId: Ref<UserEntity>;

  @prop()
    commentsCount: number;

  @prop({
    required: true
  })
    coordinates: Coordinates;
}

export const RentOfferModel = getModelForClass(RentOfferEntity);
