import {defaultClasses, getModelForClass, modelOptions, prop, Ref} from '@typegoose/typegoose';
import {RentOfferEntity} from '../rent-offer/index.js';
import {UserEntity} from '../user/index.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface CommentEntity extends defaultClasses.Base {
}

@modelOptions({
  schemaOptions: {
    collection: 'comments'
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class CommentEntity extends defaultClasses.TimeStamps {
  @prop({
    required: true,
    trim: true,
    minlength: [5, 'Min length of text is 1'],
    maxlength: [1024, 'Max length of text is 1024']
  })
    text: string;

  @prop({
    required: true
  })
    createdDate: Date;

  @prop({
    required: true,
    min: 1,
    max: 5
  })
    rating: number;

  @prop({
    required: true,
    ref: RentOfferEntity,
  })
    rentOfferId: Ref<RentOfferEntity>;

  @prop({
    required: true,
    ref: UserEntity,
  })
    authorId: Ref<UserEntity>;
}

export const CommentModel = getModelForClass(CommentEntity);
