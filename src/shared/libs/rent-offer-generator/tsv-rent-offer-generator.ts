import dayjs from 'dayjs';
import {generateRandomValue, getRandomItem, getRandomItems} from '../../helpers/index.js';
import {HousingType, MockServerData} from '../../types/index.js';
import {RentOfferGenerator} from './rent-offer-generator.interface.js';

const MIN_RATING = 1;
const MAX_RATING = 5;

const MIN_PRICE = 100;
const MAX_PRICE = 100000;

const MIN_ROOMS_COUNT = 1;
const MAX_ROOMS_COUNT = 8;

const MIN_GUEST_COUNT = 1;
const MAX_GUEST_COUNT = 10;

const FIRST_WEEK_DAY = 1;
const LAST_WEEK_DAY = 7;

export class TSVRentOfferGenerator implements RentOfferGenerator {
  constructor(private readonly mockData: MockServerData) {
  }

  public generate(): string {
    const title = getRandomItem<string>(this.mockData.titles);
    const description = getRandomItem<string>(this.mockData.descriptions);
    const previewImage = getRandomItem<string>(this.mockData.previewImages);
    const housingPhoto = getRandomItem<string>(this.mockData.housingPhotos);
    const cityWithCoordinates = getRandomItem<string>(this.mockData.citiesWithCoordinates);
    const isPremium = getRandomItem([true, false]);
    const rating = generateRandomValue(MIN_RATING, MAX_RATING).toString();
    const housingType = getRandomItem([HousingType.Apartment, HousingType.House, HousingType.Room, HousingType.Hotel]);
    const roomsCount = generateRandomValue(MIN_ROOMS_COUNT, MAX_ROOMS_COUNT).toString();
    const guestCount = generateRandomValue(MIN_GUEST_COUNT, MAX_GUEST_COUNT).toString();
    const price = generateRandomValue(MIN_PRICE, MAX_PRICE).toString();
    const conveniences = getRandomItems(this.mockData.conveniences).join(';');
    const firstname = getRandomItem(this.mockData.firstnames);
    const avatarPath = getRandomItem(this.mockData.avatarPaths);
    const type = getRandomItem(this.mockData.types);
    const commentsCount = getRandomItem(this.mockData.commentsCount);

    const createdDate = dayjs()
      .subtract(generateRandomValue(FIRST_WEEK_DAY, LAST_WEEK_DAY), 'day')
      .toISOString();

    const cityData = cityWithCoordinates.split(';');
    const city = cityData[0];
    const coordinates = [cityData[1], cityData[2]].join(';');

    return [
      title, description, createdDate, city, previewImage, housingPhoto,
      isPremium, rating, housingType, roomsCount, guestCount,
      price, conveniences, firstname, avatarPath, type, commentsCount, coordinates
    ].join('\t');
  }
}
