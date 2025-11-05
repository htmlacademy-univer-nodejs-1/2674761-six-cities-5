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
