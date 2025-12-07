import 'reflect-metadata';
import {Container} from 'inversify';
import {createRestApplicationContainer, SixCitiesApplication} from './rest/index.js';
import { createUserContainer } from './shared/modules/user/user.container.js';
import { createRentOfferContainer } from './shared/modules/rent-offer/rent-offer.container.js';
import {Component} from './shared/types/index.js';
import { createCommentContainer } from './shared/modules/comment/comment.container.js';
import { createSessionContainer } from './shared/modules/session/session.container.js';


async function bootstrap() {
  const appContainer = Container.merge(
    createRestApplicationContainer(),
    createUserContainer(),
    createRentOfferContainer(),
    createCommentContainer(),
    createSessionContainer()
  );
  const application = appContainer.get<SixCitiesApplication>(Component.SixCitiesApplication);
  await application.init();
}

bootstrap();
