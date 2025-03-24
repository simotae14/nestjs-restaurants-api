import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../auth/schemas/user.schema';
import * as mongoose from 'mongoose';

@Schema()
export class Location {
  @Prop({
    type: String,
    enum: ['Point'],
  })
  type: string;

  @Prop({ index: '2dsphere' })
  coordinates: number[];

  @Prop()
  formattedAddress: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zipcode: string;

  @Prop()
  country: string;
}

export enum Category {
  FAST_FOOD = 'Fast Food',
  CAFE = 'Cafe',
  FINE_DINING = 'Fine Dining',
}

@Schema()
export class Restaurant {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  email: string;

  @Prop()
  phoneNo: number;

  @Prop()
  address: string;

  @Prop()
  category: Category;

  @Prop()
  images?: object[];

  @Prop({ type: Object, ref: 'Location' })
  location?: Location;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
