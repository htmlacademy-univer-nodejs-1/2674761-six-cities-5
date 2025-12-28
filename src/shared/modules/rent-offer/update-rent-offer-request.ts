import {PatchRentOfferDto} from './dto/patch-rent-offer.dto.js';
import {RequestBody} from '../../libs/rest/index.js';
import {Request} from 'express';
import { ParamRentOfferId } from './types/param-rent-offer-id.type.js';


export type UpdateRentOfferRequest = Request<ParamRentOfferId, RequestBody, PatchRentOfferDto>;
