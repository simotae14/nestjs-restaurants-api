/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Location } from '../schemas/restaurant.schema';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const nodeGeoCoder = require('node-geocoder');

export default class APIFeatures {
  static async getRestaurantLocation(address: string) {
    try {
      const options = {
        provider: process.env.GEOCODER_PROVIDER,
        httpAdapter: 'https',
        apiKey: process.env.GEOCODER_API_KEY,
        formatter: null,
      };

      const geoCoder = nodeGeoCoder(options);

      const loc = await geoCoder.geocode(address);

      const {
        latitude,
        longitude,
        formattedAddress,
        city,
        stateCode,
        zipcode,
        countryCode,
      } = loc[0];

      const location: Location = {
        type: 'Point',
        coordinates: [longitude, latitude],
        formattedAddress,
        city,
        state: stateCode,
        zipcode,
        country: countryCode,
      };

      return location;
    } catch (error) {
      console.log(error.message);
    }
  }
}
