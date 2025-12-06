import got from 'got';
import {getErrorMessage} from '../../shared/helpers/index.js';
import {TSVFileWriter} from '../../shared/libs/file-writer/index.js';
import {TSVRentOfferGenerator} from '../../shared/libs/rent-offer-generator/tsv-rent-offer-generator.js';
import {MockServerData} from '../../shared/types/index.js';
import {Command} from './command.interface.js';

export class GenerateCommand implements Command {
  private initialData: MockServerData;

  public getName(): string {
    return '--generate';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [count, filepath, url] = parameters;
    const offerCount = Number.parseInt(count, 10);
    try {
      await this.load(url);
      await this.write(filepath, offerCount);
      console.info(`File ${filepath} was created!`);
    } catch (error: unknown) {
      console.error('Can\'t generate data');
      console.error(getErrorMessage(error));
    }
  }

  private async write(filepath: string, offerCount: number) {
    const tsvOfferGenerator = new TSVRentOfferGenerator(this.initialData);
    const tsvFileWriter = new TSVFileWriter(filepath);
    for (let i = 0; i < offerCount; i++) {
      await tsvFileWriter.write(tsvOfferGenerator.generate());
    }
  }

  private async load(url: string) {
    try {
      this.initialData = await got.get(url).json();
    } catch {
      throw new Error(`Can't load data from ${url}`);
    }
  }
}
