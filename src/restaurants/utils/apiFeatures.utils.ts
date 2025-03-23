/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { S3 } from 'aws-sdk';
import { Location } from '../schemas/restaurant.schema';
import { JwtService } from '@nestjs/jwt';

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

  // Upload Images
  static async uploadImages(files: any) {
    return new Promise((resolve, reject) => {
      const s3 = new S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      });

      const images: any[] = [];

      files.forEach(async (file: any) => {
        const splitFile = file.originalname.split('.');
        const random = Date.now();

        const fileName = `${splitFile[0]}_${random}.${splitFile[1]}`;

        const params = {
          Bucket: `${process.env.AWS_S3_BUCKET_NAME}/restaurants`,
          Key: fileName,
          Body: file.buffer,
        };

        const uploadResponse = await s3.upload(params).promise();

        images.push(uploadResponse);

        if (images.length === files.length) {
          resolve(images);
        }
      });
    });
  }

  // Delete Images
  static async deleteImages(images?: object[]) {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });

    const imageskeys =
      images?.map((image: any) => {
        return {
          Key: image.Key,
        };
      }) || [];

    const params = {
      Bucket: `${process.env.AWS_S3_BUCKET_NAME}`,
      Delete: {
        Objects: imageskeys,
        Quiet: false,
      },
    };

    return new Promise((resolve, reject) => {
      s3.deleteObjects(params, function (err, data) {
        if (err) {
          console.log(err);
          reject(false); // saying the deletion was not successful
        } else {
          resolve(true);
        }
      });
    });
  }

  // Assign JWT Token
  static async assignJwtToken(
    userId: string,
    jwtService: JwtService,
  ): Promise<string> {
    const payload = { id: userId };

    // eslint-disable-next-line @typescript-eslint/await-thenable
    const token = await jwtService.sign(payload);

    return token;
  }
}
