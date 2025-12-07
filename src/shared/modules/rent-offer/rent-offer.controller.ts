import {inject, injectable} from 'inversify';
import {BaseController, HttpMethod} from '../../libs/rest/index.js';
import {Component} from '../../types/index.js';
import {Logger} from '../../libs/logger/index.js';
import {Request, Response} from 'express';
import {fillDTO} from '../../helpers/index.js';
import {RentOfferService} from './rent-offer-service.interface.js';
import {CreateRentOfferRequest} from './create-rent-offer-request.js';
import {RentOfferResponseRdo} from './rdo/rent-offer-response.rdo.js';
import {RentOfferRdo} from './rdo/rent-offer.rdo.js';

@injectable()
export class RentOfferController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.RentOfferService) private readonly rentOfferService: RentOfferService,
    // @inject(Component.CommentService) private readonly commentService: CommentService,
  ) {
    super(logger);
    this.logger.info('Register routes for RentOfferController…');

    this.addRoute({path: '', method: HttpMethod.Post, handler: this.create});
    this.addRoute({path: '/', method: HttpMethod.Get, handler: this.getOffers});
    // this.addRoute({path: '/:id', method: HttpMethod.Post, handler: this.getOffer});
    // this.addRoute({path: '/:id', method: HttpMethod.Patch, handler: this.update});
    // this.addRoute({path: '/:id', method: HttpMethod.Delete, handler: this.delete});
    // this.addRoute({path: '/:id/comments', method: HttpMethod.Get, handler: this.getComments});
    // this.addRoute({path: '/:id/comments', method: HttpMethod.Post, handler: this.addComment});
    // this.addRoute({path: 'city/:city/premium', method: HttpMethod.Get, handler: this.getCityPremium});

  }

  public async create(
    {body}: CreateRentOfferRequest,
    res: Response,
  ): Promise<void> {
    const rentOffers = await this.rentOfferService.create(body);
    this.created(res, fillDTO(RentOfferRdo, rentOffers));
  }

  public async getOffers(_req: Request, res: Response): Promise<void> {
    const rentOffers = await this.rentOfferService.find();
    this.ok(res, fillDTO(RentOfferResponseRdo, rentOffers));
  }

  // public async getOffer(
  //   {params}: Request<ParamOfferId>,
  //   res: Response,
  // ): Promise<void> {
  //   const {rentOfferId} = params;
  //   const result = await this.rentOfferService.findById(rentOfferId);
  //   this.ok(res, fillDTO(RentOfferResponseRdo, result));
  // }

  // public async update({
  //   body,
  //   params
  // }: UpdateRentOfferRequest, res: Response): Promise<void> {
  //   const updatedOffer = await this.rentOfferService.patch(params.offerId, body);
  //   this.created(res, fillDTO(RentOfferRdo, updatedOffer));
  // }

  // public async delete({params}: Request<ParamOfferId>, res: Response): Promise<void> {
  //   const {offerId} = params;
  //   const offer = await this.rentOfferService.delete(offerId);
  //   this.noContent(res, offer);
  // }

  // public async getComments(
  //   {params}: Request<ParamOfferId, UnknownRecord, UnknownRecord>,
  //   res: Response
  // ): Promise<void> {
  //   const comments = await this.commentService.findByRentOfferId(params.offerId);
  //   this.ok(res, fillDTO(CommentRdo, comments));
  // }
  //
  // public async addComment({body}: CreateRentOfferRequest,
  //   res: Response): Promise<void> {
  //   const comment = await this.commentService.create(body);
  //   this.created(res, fillDTO(CommentRdo, comment));
  // }

  // public async getCityPremium({params}: Request<ParamsCity>, res: Response): Promise<void> {
  //   const offers = await this.rentOfferService.findPremiumByCity(params.city);
  //   this.ok(res, fillDTO(RentOfferResponseRdo, offers));
  // }
}
