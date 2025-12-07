import {defaultClasses, getModelForClass, modelOptions, prop, Ref} from '@typegoose/typegoose';
import {UserEntity} from '../user/index.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface SessionEntity extends defaultClasses.Base {
}

@modelOptions({
  schemaOptions: {
    collection: 'sessions'
  }
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class SessionEntity extends defaultClasses.TimeStamps {
  @prop({
    required: true,
    ref: UserEntity,
  })
    userId: Ref<UserEntity>;
}

export const SessionModel = getModelForClass(SessionEntity);
