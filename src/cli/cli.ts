#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import chalk from 'chalk';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import readline from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type City = 'Paris' | 'Cologne' | 'Brussels' | 'Amsterdam' | 'Hamburg' | 'Dusseldorf';
export type HomeType = 'apartment' | 'house' | 'room' | 'hotel';
export type Amenity =
  | 'Breakfast'
  | 'Air conditioning'
  | 'Laptop friendly workspace'
  | 'Baby seat'
  | 'Washer'
  | 'Towels'
  | 'Fridge';

export interface TemplateItem {
  title: string;
  description: string;
  city: City;
  previewImage: string;
  images: string[];
  amenities: string[];
  type: HomeType;
  rooms: number;
  guests: number;
  price: number;
  isPremium?: boolean;
}

export interface RentalOffer {
  title: string;
  description: string;
  publicationDate: string;
  city: City;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: HomeType;
  rooms: number;
  guests: number;
  price: number;
  amenities: Amenity[];
  author: string;
  commentsCount: number;
  latitude: number;
  longitude: number;
}

const AMENITIES: Amenity[] = [
  'Breakfast',
  'Air conditioning',
  'Laptop friendly workspace',
  'Baby seat',
  'Washer',
  'Towels',
  'Fridge'
];

const CITIES_COORDS: Record<City, { latitude: number; longitude: number }> = {
  Paris: { latitude: 48.85661, longitude: 2.351499 },
  Cologne: { latitude: 50.938361, longitude: 6.959974 },
  Brussels: { latitude: 50.846557, longitude: 4.351697 },
  Amsterdam: { latitude: 52.370216, longitude: 4.895168 },
  Hamburg: { latitude: 53.550341, longitude: 10.000654 },
  Dusseldorf: { latitude: 51.225402, longitude: 6.776314 }
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TSV_HEADER = `${[
  'title',
  'description',
  'publicationDate',
  'city',
  'previewImage',
  'images',
  'isPremium',
  'isFavorite',
  'rating',
  'type',
  'rooms',
  'guests',
  'price',
  'amenities',
  'author',
  'latitude',
  'longitude'
].join('\t') }\n`;

function escapeCell(s: string): string {
  return s.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
}

function buildOfferFromTemplate(template: TemplateItem, idx: number): RentalOffer {
  const now = Date.now();
  const publicationDate = new Date(now - randInt(0, 1000 * 60 * 60 * 24 * 365)).toISOString();
  const base = CITIES_COORDS[template.city];
  const jitter = () => (Math.random() - 0.5) * 0.05;
  const latitude = +(base.latitude + jitter()).toFixed(6);
  const longitude = +(base.longitude + jitter()).toFixed(6);
  const rating = +((Math.random() * 4 + 1).toFixed(1));
  const amenities = shuffle(template.amenities.concat(AMENITIES)).slice(0, randInt(1, Math.min(AMENITIES.length, template.amenities.length + 2))) as Amenity[];
  const offer: RentalOffer = {
    title: `${template.title} #${idx + 1}`,
    description: template.description,
    publicationDate,
    city: template.city,
    previewImage: template.previewImage,
    images: template.images.slice(0, 6),
    isPremium: Boolean(template.isPremium),
    isFavorite: Math.random() > 0.7,
    rating,
    type: template.type,
    rooms: template.rooms,
    guests: template.guests,
    price: template.price,
    amenities,
    author: `https://example.com/users/${randInt(1, 1000)}`,
    commentsCount: 0,
    latitude,
    longitude
  };
  return offer;
}

export async function generateOffers(n: number, filepath: string, templatesUrl: string): Promise<void> {
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('n must be positive');
  }
  const resp = await axios.get(templatesUrl, { timeout: 10000 });
  if (!Array.isArray(resp.data)) {
    throw new Error('templates endpoint must return array');
  }
  const templates = resp.data as TemplateItem[];
  if (templates.length === 0) {
    throw new Error('templates array is empty');
  }
  const fileStream = fs.createWriteStream(filepath, { encoding: 'utf8' });
  await new Promise<void>((resolve, reject) => {
    fileStream.write(TSV_HEADER, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  const gen = async function* () {
    for (let i = 0; i < n; i++) {
      const t = pick(templates);
      const o = buildOfferFromTemplate(t, i);
      yield o;
    }
  };
  const readable = Readable.from(gen(), { objectMode: true });
  const toTsv = new Transform({
    writableObjectMode: true,
    readableObjectMode: false,
    transform(chunk: RentalOffer, _enc, cb) {
      const row = `${[
        escapeCell(chunk.title),
        escapeCell(chunk.description),
        escapeCell(chunk.publicationDate),
        escapeCell(chunk.city),
        escapeCell(chunk.previewImage),
        escapeCell(chunk.images.join('|')),
        chunk.isPremium ? 'true' : 'false',
        chunk.isFavorite ? 'true' : 'false',
        String(chunk.rating),
        chunk.type,
        String(chunk.rooms),
        String(chunk.guests),
        String(chunk.price),
        escapeCell(chunk.amenities.join(';')),
        escapeCell(chunk.author),
        String(chunk.latitude),
        String(chunk.longitude)
      ].join('\t') }\n`;
      cb(null, row);
    }
  });
  await pipeline(
    readable,
    toTsv,
    fileStream
  );
}

export async function importLargeTsv(filepath: string): Promise<void> {
  const stream = fs.createReadStream(filepath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let headerParsed = false;
  let headers: string[] = [];
  let lineNo = 0;
  for await (const line of rl) {
    lineNo++;
    if (!headerParsed) {
      headers = line.split('\t').map((h) => h.trim());
      headerParsed = true;
      continue;
    }
    if (line.trim() === '') {
      continue;
    }
    const cols = line.split('\t');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    const title = row['title'] ?? '';
    const city = row['city'] ?? '';
    const price = row['price'] ?? '';
    if (!title || !city || !price) {
      console.error(chalk.red(`Line ${lineNo}: missing required fields (title/city/price).`));
      continue;
    }
    console.log(chalk`{yellow Line ${lineNo - 1}} {bold ${title}} — {cyan ${city}} — {green ${price}}`);
  }
}

function printHelp(): void {
  console.log(chalk.bold('Rental CLI — список команд'));
  console.log();
  console.log(chalk`  {cyan --help}                      — показать справку (используется по умолчанию)`);
  console.log(chalk`  {cyan --version}                   — показать версию приложения (из package.json)`);
  console.log(chalk`  {cyan --import <file>}             — импортировать данные из .tsv файла (стриминг)`);
  console.log(chalk`  {cyan --generate <n> <file> <url>} — сгенерировать n записей, сохранить в <file>, брать шаблоны из <url>`);
  console.log();
  console.log(chalk.gray('Пример: npm run mock:server'));
  console.log(chalk.gray('Пример генерации: node ./bin/cli.js --generate 100 ./mocks/generated.tsv http://localhost:3001/templates'));
}

async function printVersion(): Promise<void> {
  const pkgPath = path.resolve(__dirname, '..', 'package.json');
  const content = await fs.promises.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(content) as { version?: string };
  console.log(chalk.bold('version:'), chalk.green(pkg.version ?? 'unknown'));
}

async function main(argv: string[]): Promise<void> {
  if (argv.length === 0 || argv.includes('--help')) {
    printHelp();
    return;
  }
  if (argv.includes('--version')) {
    await printVersion();
    return;
  }
  const genIdx = argv.indexOf('--generate');
  if (genIdx !== -1) {
    const nStr = argv[genIdx + 1];
    const file = argv[genIdx + 2];
    const url = argv[genIdx + 3];
    if (!nStr || !file || !url) {
      throw new Error('Usage: --generate <n> <filepath> <templatesUrl>');
    }
    const n = Number(nStr);
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error('n must be positive number');
    }
    console.log(chalk.blue(`Generating ${n} offers to ${file} using templates from ${url}...`));
    await generateOffers(n, file, url);
    console.log(chalk.green('Generation finished.'));
    return;
  }
  const importIdx = argv.indexOf('--import');
  if (importIdx !== -1) {
    const file = argv[importIdx + 1];
    if (!file) {
      throw new Error('Usage: --import <filepath>');
    }
    console.log(chalk.blue(`Importing TSV from ${file} (streaming)`));
    await importLargeTsv(file);
    console.log(chalk.green('Import finished.'));
    return;
  }
  throw new Error('Неизвестная команда. Введите --help для списка команд.');
}

if (process.argv[1] && (process.argv[1].endsWith('cli.ts') || process.argv[1].endsWith('cli.js'))) {
  main(process.argv.slice(2)).catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exitCode = 2;
  });
}

export default { generateOffers, importLargeTsv };
