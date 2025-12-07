import {createRentOffer, getErrorMessage, getMongoURI} from '../../shared/helpers/index.js';
import {DatabaseClient, MongoDatabaseClient} from '../../shared/libs/database-client/index.js';
import {TSVFileReader} from '../../shared/libs/file-reader/tsv-file-reader.js';
import {ConsoleLogger, Logger} from '../../shared/libs/logger/index.js';
import {DefaultRentOfferService, RentOfferModel} from '../../shared/modules/rent-offer/index.js';
import {RentOfferService} from '../../shared/modules/rent-offer/rent-offer-service.interface.js';
import {DefaultUserService, UserModel} from '../../shared/modules/user/index.js';
import {UserService} from '../../shared/modules/user/user-service.interface.js';
import {RentOffer} from '../../shared/types/index.js';
import {DEFAULT_DB_PORT, DEFAULT_USER_PASSWORD} from './command.constant.js';
import {Command} from './command.interface.js';

export class ImportCommand implements Command {
  private userService: UserService;
  private rentOfferService: RentOfferService;
  private databaseClient: DatabaseClient;
  private readonly logger: Logger;
  private salt: string;

  constructor() {
    this.onImportedLine = this.onImportedLine.bind(this);
    this.onCompleteImport = this.onCompleteImport.bind(this);

    this.logger = new ConsoleLogger();
    this.rentOfferService = new DefaultRentOfferService(this.logger, RentOfferModel);
    this.userService = new DefaultUserService(this.logger, UserModel);
    this.databaseClient = new MongoDatabaseClient(this.logger);
  }

  public getName(): string {
    return '--import';
  }

  public async execute(filename: string, login: string, password: string, host: string, dbname: string, salt: string): Promise<void> {
    const uri = getMongoURI(login, password, host, DEFAULT_DB_PORT, dbname);
    this.salt = salt;

    await this.databaseClient.connect(uri);

    const fileReader = new TSVFileReader(filename.trim());

    fileReader.on('line', this.onImportedLine);
    fileReader.on('end', this.onCompleteImport);

    try {
      await fileReader.read();
    } catch (error) {
      console.error(`Can't import data from file: ${filename}`);
      console.error(getErrorMessage(error));
    }
  }

  private async onImportedLine(line: string, resolve: () => void) {
    const offer = createRentOffer(line);
    await this.saveOffer(offer);
    resolve();
  }

  private onCompleteImport(count: number) {
    console.info(`${count} rows imported.`);
    this.databaseClient.disconnect();
  }

  private async saveOffer(rentOffer: RentOffer) {
    const user = await this.userService.findOrCreate({
      ...rentOffer.author,
      password: DEFAULT_USER_PASSWORD
    }, this.salt);

    await this.rentOfferService.create({
      title: rentOffer.title,
      description: rentOffer.description,
      createdDate: rentOffer.createdDate,
      city: rentOffer.city,
      previewImage: rentOffer.previewImage,
      housingPhoto: rentOffer.housingPhoto,
      isPremium: rentOffer.isPremium,
      housingType: rentOffer.housingType,
      roomsCount: rentOffer.roomsCount,
      guestsCount: rentOffer.guestsCount,
      price: rentOffer.price,
      conveniences: rentOffer.conveniences,
      authorId: user.id,
      coordinates: rentOffer.coordinates,
      isFavorite: false,
      rating: 0,
      commentsCount: 0
    });

  }
}
