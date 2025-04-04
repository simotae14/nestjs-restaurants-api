import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Restaurant } from './schemas/restaurant.schema';
import { Query } from 'express-serve-static-core';
import APIFeatures from './utils/apiFeatures.utils';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: mongoose.Model<Restaurant>,
  ) {}

  // Get All Restaurants => GET /api/restaurants
  async findAll(query: Query): Promise<Restaurant[]> {
    const resultsPerPage = 2;
    const currentPage = Number(query.page) || 1;
    const skip = resultsPerPage * (currentPage - 1);

    const keyword = query.keyword
      ? {
          name: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};
    const restaurants = await this.restaurantModel
      .find({ ...keyword })
      .limit(resultsPerPage)
      .skip(skip);

    return restaurants;
  }

  // Create a Restaurant => POST /api/restaurants
  async create(restaurant: Restaurant, user: User): Promise<Restaurant> {
    const location = await APIFeatures.getRestaurantLocation(
      restaurant.address,
    );

    const data = Object.assign(restaurant, {
      user: user._id,
      location,
    });
    const res = await this.restaurantModel.create(data);
    return res;
  }

  // Get a Restaurant by ID => GET /api/restaurants/:id
  async findById(id: string): Promise<Restaurant> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new BadRequestException(
        'Wrong mongoose Id Error. Please enter correct ID.',
      );
    }

    const restaurant = await this.restaurantModel.findById(id);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    return restaurant;
  }

  // Update a Restaurant by ID => PUT /api/restaurants/:id
  async updateById(
    id: string,
    restaurant: Restaurant,
  ): Promise<Restaurant | null> {
    return await this.restaurantModel.findByIdAndUpdate(id, restaurant, {
      new: true,
      runValidators: true,
    });
  }

  // Delete a Restaurant by ID => DELETE /api/restaurants/:id
  async deleteById(id: string): Promise<Restaurant | null> {
    return await this.restaurantModel.findByIdAndDelete(id);
  }

  // Upload Images => PUT /api/restaurants/upload/:id
  async uploadImages(id: string, files: any) {
    const images = await APIFeatures.uploadImages(files);

    // retrieve the restaurant
    const restaurant = await this.restaurantModel.findByIdAndUpdate(
      id,
      {
        images: images as object[],
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return restaurant;
  }

  async deleteImages(images?: object[]) {
    if (images?.length === 0) {
      return true;
    }
    const res = await APIFeatures.deleteImages(images);

    return res;
  }
}
