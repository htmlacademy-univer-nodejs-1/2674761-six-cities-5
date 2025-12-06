import 'reflect-metadata';
import {Container} from 'inversify';
import {SixCitiesApplication} from './rest/index.js';
import {createRestApplicationContainer} from './rest/six-cities.container.js';
import {Component} from './shared/types/index.js';
import { createRentOfferContainer } from './shared/modules/rent-offer/rent-offer.container.js';
import { createUserContainer } from './shared/modules/user/user.container.js';


async function bootstrap() {
  const appContainer = Container.merge(
    createRestApplicationContainer(),
    createUserContainer(),
    createRentOfferContainer()
  );
  const application = appContainer.get<SixCitiesApplication>(Component.SixCitiesApplication);
  await application.init();
}

bootstrap();
