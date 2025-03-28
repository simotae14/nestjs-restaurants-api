/* eslint-disable @typescript-eslint/no-base-to-string */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { Restaurant } from '../restaurants/schemas/restaurant.schema';
import { Meal } from './schemas/meal.schema';

@Injectable()
export class MealService {
  constructor(
    @InjectModel(Meal.name)
    private mealModel: mongoose.Model<Meal>,
    @InjectModel(Restaurant.name)
    private restaurantModel: mongoose.Model<Restaurant>,
  ) {}

  // Get all meals  =>  GET  /api/meals
  async findAll(): Promise<Meal[]> {
    const meals = await this.mealModel.find();
    return meals;
  }

  // Get all meals of a restaurant  =>  GET  /api/meals/restaurant
  async findByRestaurant(restaurantId: string): Promise<Meal[]> {
    const meals = await this.mealModel.find({ restaurant: restaurantId });
    return meals;
  }

  // Create a new meal  =>  POST  /api/meals/restaurant/:id
  async create(meal: Meal, user: User): Promise<Meal> {
    const data = Object.assign(meal, { user: user._id });

    // Saving meal ID in the restaurant menu
    const restaurant = await this.restaurantModel.findById(meal.restaurant);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found with this ID.');
    }

    // Check ownership of the restaurant
    if (restaurant.user.toString() !== (user._id as string).toString()) {
      throw new ForbiddenException('You can not add meal to this restaurant.');
    }

    const mealCreated = await this.mealModel.create(data);

    restaurant.menu?.push(mealCreated._id);
    await restaurant.save();

    return mealCreated;
  }

  // Get single meal  =>  GET  /api/meals/id
  async findById(id: string): Promise<Meal> {
    // check if the id is valid
    const isValidId = mongoose.isValidObjectId(id);
    if (!isValidId) {
      throw new BadRequestException('Wrong mongoose ID error.');
    }
    const meal = await this.mealModel.findById(id);

    if (!meal) {
      throw new NotFoundException('Meal not found with this ID.');
    }

    return meal;
  }

  // Update meal  =>  PUT  /api/meals/:id
  async updateById(id: string, meal: Meal): Promise<Meal> {
    const updatedMeal = await this.mealModel.findByIdAndUpdate(id, meal, {
      new: true,
      runValidators: true,
    });

    if (!updatedMeal) {
      throw new NotFoundException('Meal not found with this ID.');
    }

    return updatedMeal;
  }
}
