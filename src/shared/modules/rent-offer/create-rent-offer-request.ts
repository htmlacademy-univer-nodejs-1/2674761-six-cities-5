import {Request} from 'express';
import {RequestBody, RequestParams} from '../../libs/rest/index.js';
import {CreateRentOfferDto} from './dto/create-rent-offer.dto.js';

export type CreateRentOfferRequest = Request<RequestParams, RequestBody, CreateRentOfferDto>;
