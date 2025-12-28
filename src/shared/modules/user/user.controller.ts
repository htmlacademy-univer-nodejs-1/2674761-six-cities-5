import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {
  BaseController,
  HttpError,
  HttpMethod,
  RequestBody,
  RequestParams,
  UploadFileMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware
} from '../../libs/rest/index.js';
import {Logger} from '../../libs/logger/index.js';
import {Component} from '../../types/index.js';
import {UserService} from './user-service.interface.js';
import {Config, SixCitiesAppSchema} from '../../libs/config/index.js';
import {fillDTO} from '../../helpers/index.js';
import {inject, injectable} from 'inversify';
import {CreateUserRequest} from './create-user-request.js';
import {UserRdo} from './rdo/user.rdo.js';
import {LoginUserRequest} from './login-user-request.js';
import {CreateUserDto} from './dto/create-user.dto.js';
import {LoginUserDto} from './dto/login-user.dto.js';
import {SessionService} from '../session/session-service.interface.js';
import {RentOfferResponseRdo} from '../rent-offer/rdo/rent-offer-response.rdo.js';
import { PrivateRouteMiddleware } from '../../libs/rest/middleware/private-route.middleware.js';
import { PatchFavoritesRentOffersDto } from '../session/dto/patch-favorites-rent-offers.dto.js';
import { LoggedUserRdo } from './rdo/logged.rdo.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly configService: Config<SixCitiesAppSchema>,
    @inject(Component.SessionService) private readonly sessionService: SessionService,
  ) {
    super(logger);
    this.logger.info('Register routes for UserController…');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateUserDto)]
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserDto)]
    });
    this.addRoute({path: '/login', method: HttpMethod.Get, handler: this.getSession});
    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar'),
      ]
    });
    this.addRoute({
      path: '/rent-offers/favorite',
      method: HttpMethod.Post,
      handler: this.addFavorite,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute({
      path: '/rent-offers/favorite',
      method: HttpMethod.Delete,
      handler: this.deleteFavorite,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute({
      path: '/rent-offers/favorite',
      method: HttpMethod.Get,
      handler: this.getFavorites,
      middlewares: [new PrivateRouteMiddleware()]
    });
  }

  public async create(
    {body}: CreateUserRequest,
    res: Response,
  ): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (existsUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email «${body.email}» exists.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.created(res, fillDTO(UserRdo, result));
  }

  public async login(
    {body}: LoginUserRequest,
    res: Response,
  ): Promise<void> {
    const user = await this.sessionService.verify(body);
    const token = await this.sessionService.authenticate(user);
    const responseData = fillDTO(LoggedUserRdo, {
      email: user.email,
      token,
    });
    this.ok(res, responseData);
  }

  public async getSession(
    {tokenPayload: {email}}: Request, res: Response
  ): Promise<void> {
    const foundedUser = await this.userService.findByEmail(email);

    if (!foundedUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    this.ok(res, fillDTO(LoggedUserRdo, foundedUser));
  }

  public async uploadAvatar(req: Request, res: Response): Promise<void> {
    this.created(res, {
      filepath: req.file?.path
    });
  }

  public async addFavorite({
    body,
    tokenPayload
  }: Request<RequestParams, RequestBody, PatchFavoritesRentOffersDto>, res: Response): Promise<void> {
    await this.userService.addFavorite(body.rentOfferId, tokenPayload.id);
    this.noContent(res, null);
  }

  public async deleteFavorite({
    body,
    tokenPayload
  }: Request<RequestParams, RequestBody, PatchFavoritesRentOffersDto>, res: Response): Promise<void> {
    await this.userService.deleteFavorite(body.rentOfferId, tokenPayload.id);
    this.noContent(res, null);
  }

  public async getFavorites({tokenPayload}: Request<RequestParams, RequestBody, void>, res: Response): Promise<void> {
    const result = await this.userService.findFavoriteOffers(tokenPayload.id);
    this.ok(res, fillDTO(RentOfferResponseRdo, result));
  }
}
