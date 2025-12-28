import {inject, injectable} from 'inversify';
import {
  BaseController,
  DocumentExistsMiddleware,
  HttpMethod,
  RequestBody,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware
} from '../../libs/rest/index.js';
import {Component} from '../../types/index.js';
import {Logger} from '../../libs/logger/index.js';
import {Request, Response} from 'express';
import {fillDTO} from '../../helpers/index.js';
import {RentOfferService} from './rent-offer-service.interface.js';
import {CreateRentOfferRequest} from './create-rent-offer-request.js';
import {RentOfferResponseRdo} from './rdo/rent-offer-response.rdo.js';
import {RentOfferRdo} from './rdo/rent-offer.rdo.js';
import {CommentRdo} from '../comment/rdo/comment.rdo.js';
import {CommentService} from '../comment/comment-service.interface.js';
import {UpdateRentOfferRequest} from './update-rent-offer-request.js';
import {CreateRentOfferDto} from './dto/create-rent-offer.dto.js';
import {PatchRentOfferDto} from './dto/patch-rent-offer.dto.js';
import {UserService} from '../user/user-service.interface.js';
import { PrivateRouteMiddleware } from '../../libs/rest/middleware/private-route.middleware.js';
import { ParamsCity } from './types/param-city.type.js';
import { ParamRentOfferId } from './types/param-rent-offer-id.type.js';
import { RequestQuery } from './types/request-query.type.js';

@injectable()
export class RentOfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.RentOfferService) private readonly rentOfferService: RentOfferService,
    @inject(Component.CommentService) private readonly commentService: CommentService,
    @inject(Component.UserService) private readonly userService: UserService
  ) {
    super(logger);
    this.logger.info('Register routes for RentOfferController…');

    this.addRoute({
      path: '',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateRentOfferDto)]
    });
    this.addRoute({path: '/', method: HttpMethod.Get, handler: this.index});
    this.addRoute({
      path: '/:rentOfferId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('rentOfferId'),
        new DocumentExistsMiddleware(this.rentOfferService, 'RentOffer', 'rentOfferId')]
    });
    this.addRoute({
      path: '/:rentOfferId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('rentOfferId'),
        new ValidateDtoMiddleware(PatchRentOfferDto),
        new DocumentExistsMiddleware(this.rentOfferService, 'RentOffer', 'rentOfferId')]
    });
    this.addRoute({
      path: '/:rentOfferId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('rentOfferId'),
        new DocumentExistsMiddleware(this.rentOfferService, 'RentOffer', 'rentOfferId')]
    });
    this.addRoute({
      path: '/:rentOfferId/comments',
      method: HttpMethod.Get,
      handler: this.getComments,
      middlewares: [
        new ValidateObjectIdMiddleware('rentOfferId'),
        new DocumentExistsMiddleware(this.rentOfferService, 'RentOffer', 'rentOfferId')]
    });
    this.addRoute({path: '/city/:city/premium', method: HttpMethod.Get, handler: this.getCityPremium});

  }

  public async create(
    {body, tokenPayload}: CreateRentOfferRequest,
    res: Response,
  ): Promise<void> {
    const result = await this.rentOfferService.create({...body, authorId: tokenPayload.id});
    const rentOffer = await this.rentOfferService.findById(result.id);
    this.created(res, fillDTO(RentOfferRdo, rentOffer));
  }

  public async index(_req: Request<unknown, RequestBody, unknown, RequestQuery>, res: Response): Promise<void> {
    const rentOffers = await this.rentOfferService.find(Number(_req.query.limit));

    if (_req.tokenPayload) {
      const favoriteOffers = await this.userService.findFavoriteOffers(_req.tokenPayload.id);
      const favoriteOfferIds = favoriteOffers.map((offer) => offer.id);
      for (const rentOffer of rentOffers) {
        rentOffer.isFavorite = favoriteOfferIds.includes(rentOffer._id.toString());
      }
    }

    this.ok(res, fillDTO(RentOfferResponseRdo, rentOffers));
  }

  public async show(
    {params, tokenPayload}: Request<ParamRentOfferId, RequestBody>,
    res: Response,
  ): Promise<void> {
    const {rentOfferId} = params;
    const result = await this.rentOfferService.findById(rentOfferId);
    if (tokenPayload && result) {
      const favoriteOffers = await this.userService.findFavoriteOffers(tokenPayload.id);
      result.isFavorite = favoriteOffers.map((offer) => offer.id).includes(result.id);
    }

    this.ok(res, fillDTO(RentOfferRdo, result));
  }

  public async update({
    body,
    params
  }: UpdateRentOfferRequest, res: Response): Promise<void> {
    const updatedRentOffer = await this.rentOfferService.patch(params.rentOfferId, body);
    this.created(res, fillDTO(RentOfferRdo, updatedRentOffer));
  }

  public async delete({params}: Request<ParamRentOfferId>, res: Response): Promise<void> {
    const {rentOfferId} = params;
    const rentOffer = await this.rentOfferService.delete(rentOfferId);
    await this.commentService.deleteByRentOfferId(rentOfferId);
    this.noContent(res, rentOffer);
  }

  public async getComments(
    {params}: Request<ParamRentOfferId>,
    res: Response
  ): Promise<void> {
    const comments = await this.commentService.findByRentOfferId(params.rentOfferId);
    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async getCityPremium({params}: Request<ParamsCity>, res: Response): Promise<void> {
    const offers = await this.rentOfferService.findPremiumByCity(params.city);
    this.ok(res, fillDTO(RentOfferResponseRdo, offers));
  }
}
