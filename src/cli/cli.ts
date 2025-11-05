#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type City = 'Paris' | 'Cologne' | 'Brussels' | 'Amsterdam' | 'Hamburg' | 'Dusseldorf';


export interface Coordinates {
latitude: number;
longitude: number;
}


export type HomeType = 'apartment' | 'house' | 'room' | 'hotel';


export type Amenity =
| 'Breakfast'
| 'Air conditioning'
| 'Laptop friendly workspace'
| 'Baby seat'
| 'Washer'
| 'Towels'
| 'Fridge';


export interface UserRef {
url: string;
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
author: UserRef;
commentsCount: number;
coordinates: Coordinates;
}


type RawRow = Record<string, string>;

interface ValidationResult {
  ok: boolean;
  errors: string[];
  data?: RentalOffer;
}

/* ---------- helpers ---------- */

function printHelp(): void {
  console.log(chalk.bold('Rental CLI — список команд'));
  console.log();
  console.log(chalk`  {cyan --help}       — показать справку (используется по умолчанию)`);
  console.log(chalk`  {cyan --version}    — показать версию приложения (из package.json)`);
  console.log(chalk`  {cyan --import <file>} — импортировать данные из .tsv файла и вывести результат`);
  console.log();
  console.log(chalk.gray('Пример: rental-cli --import ./mocks/offers.tsv'));
}

async function printVersion(): Promise<void> {
  const pkgPath = path.resolve(__dirname, '..', 'package.json');
  try {
    const content = await readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(content) as { version?: string };
    if (!pkg.version) {
      throw new Error('package.json содержит нет поля version');
    }
    console.log(chalk.bold('version:'), chalk.green(pkg.version));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Не удалось прочитать package.json: ${msg}`);
  }
}

function parseTSV(content: string): RawRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return [];
  }
  const header = lines[0].split('\t').map((h) => h.trim());
  const rows: RawRow[] = lines.slice(1).map((line) => {
    const cols = line.split('\t');
    const obj: RawRow = {};
    header.forEach((h, i) => {
      obj[h] = (cols[i] ?? '').trim();
    });
    return obj;
  });
  return rows;
}

function toBooleanStringFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const v = value.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes' || v === 'y';
}

function parseAmenities(raw: string | undefined): Amenity[] {
  if (!raw) {
    return [];
  }
  const parts = raw.split(/;|\|/).map((s) => s.trim()).filter(Boolean);
  // cast carefully: keep only allowed amenities
  const allowed: Amenity[] = [
    'Breakfast',
    'Air conditioning',
    'Laptop friendly workspace',
    'Baby seat',
    'Washer',
    'Towels',
    'Fridge',
  ];
  return parts.filter((p): p is Amenity => allowed.includes(p as Amenity));
}

/* ---------- validation & transform ---------- */

function validateAndTransform(row: RawRow): ValidationResult {
  const errors: string[] = [];
  const r = { ...row }; // shallow copy

  // title
  const title = r.title ?? '';
  if (!title) {
    errors.push('title required');
  } else if (title.length < 10 || title.length > 100) {
    errors.push('title length must be 10..100');
  }

  // description
  const description = r.description ?? '';
  if (!description) {
    errors.push('description required');
  } else if (description.length < 20 || description.length > 1024) {
    errors.push('description length must be 20..1024');
  }

  // publicationDate
  const publicationDate = r.publicationDate ?? '';
  if (!publicationDate) {
    errors.push('publicationDate required');
  }

  // city
  const cities: City[] = ['Paris','Cologne','Brussels','Amsterdam','Hamburg','Dusseldorf'];
  const cityRaw = r.city ?? '';
  if (!cityRaw) {
    errors.push('city required');
  } else if (!cities.includes(cityRaw as City)) {
    errors.push(`city must be one of ${cities.join(', ')}`);
  }

  // images
  const imagesRaw = r.images ?? '';
  const images = imagesRaw.split('|').map((s) => s.trim()).filter(Boolean);
  if (!imagesRaw) {
    errors.push('images required');
  } else if (images.length !== 6) {
    errors.push('images must contain exactly 6 URLs separated by |');
  }

  // previewImage
  const previewImage = r.previewImage ?? '';
  if (!previewImage) {
    errors.push('previewImage required');
  }

  // isPremium / isFavorite
  const isPremium = toBooleanStringFlag(r.isPremium);
  const isFavorite = toBooleanStringFlag(r.isFavorite);

  // rating
  const rating = parseFloat(r.rating ?? '');
  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    errors.push('rating must be a number between 1 and 5');
  }

  // type
  const types: HomeType[] = ['apartment','house','room','hotel'];
  const typeRaw = (r.type ?? '') as HomeType;
  if (!types.includes(typeRaw)) {
    errors.push(`type must be one of ${ types.join(', ')}`);
  }

  // rooms
  const rooms = parseInt(r.rooms ?? '', 10);
  if (Number.isNaN(rooms) || rooms < 1 || rooms > 8) {
    errors.push('rooms must be integer 1..8');
  }

  // guests
  const guests = parseInt(r.guests ?? '', 10);
  if (Number.isNaN(guests) || guests < 1 || guests > 10) {
    errors.push('guests must be integer 1..10');
  }

  // price
  const price = parseInt(r.price ?? '', 10);
  if (Number.isNaN(price) || price < 100 || price > 100000) {
    errors.push('price must be between 100 and 100000');
  }

  // amenities
  const amenities = parseAmenities(r.amenities);

  // author
  const authorRaw = r.author ?? '';
  if (!authorRaw) {
    errors.push('author required');
  }

  // coords
  const latitude = parseFloat(r.latitude ?? '');
  const longitude = parseFloat(r.longitude ?? '');
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    errors.push('latitude/longitude required and must be numbers');
  }

  // if any errors, return them
  if (errors.length > 0) {
    return { ok: false, errors };
  }

  // build RentalOffer
  const offer: RentalOffer = {
    title,
    description,
    publicationDate,
    city: cityRaw as City,
    previewImage,
    images,
    isPremium,
    isFavorite,
    rating: Math.round(rating * 10) / 10, // keep one decimal if exists
    type: typeRaw,
    rooms,
    guests,
    price,
    amenities,
    author: { url: authorRaw },
    commentsCount: 0,
    coordinates: { latitude, longitude },
  };

  return { ok: true, errors: [], data: offer };
}

/* ---------- printing ---------- */

function printOffer(offer: RentalOffer, index: number): void {
  const title = chalk.bold(offer.title);
  const price = chalk.green(`${String(offer.price) }€`);
  const premium = offer.isPremium ? chalk.yellow('★ PREMIUM') : '';
  const favorite = offer.isFavorite ? chalk.red('♥') : '';
  const rating = chalk.magenta(String(offer.rating));

  console.log(chalk`{yellow === Offer ${index + 1} ===}`);
  console.log(`${title} ${premium} ${favorite}`);
  console.log(chalk`  City: {cyan ${offer.city}}  —  Rating: {magenta ${offer.rating}}`);
  console.log(chalk`  Price: {green ${offer.price}}  Guests: {blue ${offer.guests}}  Rooms: {blue ${offer.rooms}}`);
  console.log(chalk`  Amenities: {gray ${offer.amenities.join(', ')}}`);
  console.log(chalk`  Preview: {underline ${offer.previewImage}}`);
  console.log();
}

/* ---------- main ---------- */

async function main(argv: string[]): Promise<void> {
  // default: if no args -> show help
  if (argv.length === 0 || argv.includes('--help')) {
    printHelp();
    return;
  }

  if (argv.includes('--version')) {
    await printVersion();
    return;
  }

  const importIdx = argv.indexOf('--import');
  if (importIdx !== -1) {
    const file = argv[importIdx + 1];
    if (!file) {
      throw new Error('Укажите путь до .tsv файла после --import');
    }
    const filepath = path.resolve(process.cwd(), file);
    try {
      const content = await readFile(filepath, 'utf8');
      const rows = parseTSV(content);
      const results = rows.map((r) => validateAndTransform(r));
      results.forEach((res, i) => {
        if (!res.ok) {
          console.error(chalk.red(`Offer ${i + 1} — validation errors:`));
          res.errors.forEach((e) => console.error(chalk.red(`  - ${ e}`)));
        } else {
          // res.data exists if ok
          printOffer(res.data as RentalOffer, i);
        }
      });
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Ошибка при чтении файла: ${msg}`);
    }
  }

  // unknown command
  throw new Error('Неизвестная команда. Введите --help для списка команд.');
}

/* ---------- run ---------- */

main(process.argv.slice(2))
  .catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(msg));
    // Не вызываем process.exit(), но устанавливаем код выхода
    // Node завершит процесс с этим кодом после обработки событий
    process.exitCode = 2;
  });
