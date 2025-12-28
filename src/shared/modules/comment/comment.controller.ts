import {inject, injectable} from 'inversify';
import {
  BaseController,
  HttpError,
  HttpMethod,
  ValidateDtoMiddleware
} from '../../libs/rest/index.js';
import {Component} from '../../types/index.js';
import {CommentService} from './comment-service.interface.js';
import {CreateCommentRequest} from './create-comment-request.js';
import {Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {CommentRdo} from './rdo/comment.rdo.js';
import {fillDTO} from '../../helpers/index.js';
import {RentOfferService} from '../rent-offer/rent-offer-service.interface.js';
import {Logger} from '../../libs/logger/index.js';
import {CreateCommentDto} from './dto/create-comment.dto.js';
import { PrivateRouteMiddleware } from '../../libs/rest/middleware/private-route.middleware.js';

@injectable()
export default class CommentController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.RentOfferService) private readonly rentOfferService: RentOfferService,
  ) {
    super(logger);

    this.logger.info('Register routes for CommentController…');
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new PrivateRouteMiddleware(), new ValidateDtoMiddleware(CreateCommentDto)]
    });
  }

  public async create(
    {body, tokenPayload}: CreateCommentRequest,
    res: Response
  ): Promise<void> {

    if (!await this.rentOfferService.exists(body.rentOfferId)) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `Rent offer with id ${body.rentOfferId} not found.`,
        'CommentController'
      );
    }

    const comment = await this.commentService.create({...body, authorId: tokenPayload.id});
    await this.rentOfferService.addComment(body.rentOfferId, body.rating);
    this.created(res, fillDTO(CommentRdo, comment));
  }
}
