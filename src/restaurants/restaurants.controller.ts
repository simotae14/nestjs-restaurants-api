import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { Query as ExpressQuery } from 'express-serve-static-core';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantService: RestaurantsService) {}

  @Get()
  async getAllRestaurants(@Query() query: ExpressQuery): Promise<Restaurant[]> {
    return this.restaurantService.findAll(query);
  }

  @Post()
  async createRestaurant(
    @Body()
    restaurant: CreateRestaurantDto,
  ): Promise<Restaurant> {
    return this.restaurantService.create(restaurant);
  }

  @Get(':id')
  async getRestaurant(
    @Param('id')
    id: string,
  ): Promise<Restaurant> {
    return this.restaurantService.findById(id);
  }

  @Put(':id')
  async updateRestaurant(
    @Param('id')
    id: string,
    @Body()
    restaurant: UpdateRestaurantDto,
  ): Promise<Restaurant | null> {
    await this.restaurantService.findById(id);

    return this.restaurantService.updateById(id, restaurant);
  }

  @Delete(':id')
  async deleteRestaurant(
    @Param('id')
    id: string,
  ): Promise<{ deleted: boolean }> {
    await this.restaurantService.findById(id);

    const restaurant = await this.restaurantService.deleteById(id);

    if (restaurant) {
      return { deleted: true };
    }

    return { deleted: false };
  }
}
