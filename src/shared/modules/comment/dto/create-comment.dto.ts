import {IsDateString, IsInt, IsMongoId, IsString, Max, MaxLength, Min, MinLength} from 'class-validator';
import {CreateCommentValidationMessage} from './create-comment.messages.js';

export class CreateCommentDto {
  @MinLength(5, {message: CreateCommentValidationMessage.text.minLength})
  @MaxLength(1024, {message: CreateCommentValidationMessage.text.maxLength})
  @IsString({message: CreateCommentValidationMessage.text.invalidFormat})
  public text: string;

  @IsDateString({}, {message: CreateCommentValidationMessage.createdDate.invalidFormat})
  public createdDate: Date;

  @IsInt({message: CreateCommentValidationMessage.rating.invalidFormat})
  @Min(1, {message: CreateCommentValidationMessage.rating.minValue})
  @Max(5, {message: CreateCommentValidationMessage.rating.maxValue})
  public rating: number;

  public authorId: string;

  @IsMongoId({message: CreateCommentValidationMessage.rentOfferId.invalidId})
  public rentOfferId: string;
}
