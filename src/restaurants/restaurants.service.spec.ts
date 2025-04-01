/* eslint-disable @typescript-eslint/no-unsafe-return */
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './schemas/restaurant.schema';

const mockRestaurant = {
  _id: '67e33754c600340de975a2ee',
  name: 'Retaurant fast food 2',
  description: 'This is just a description',
  email: 'ghulam@gamil.com',
  phoneNo: 9788246116,
  address: '200 Olympic Dr, Stafford, VS, 22554',
  category: 'Fast Food',
  images: [],
  location: {
    type: 'Point',
    coordinates: [-77.37622, 38.49218],
    formattedAddress: '200 Olympic Dr, Stafford, VA 22554-7763, US',
    city: 'Stafford',
    state: 'VA',
    zipcode: '22554-7763',
    country: 'US',
  },
  menu: ['67e33778c600340de975a2f3', '67e338acc600340de975a301'],
  user: '67e1e795f51290a8f81db3b1',
  createdAt: '2025-03-25T23:08:04.404Z',
  updatedAt: '2025-03-28T23:10:01.957Z',
};

const mockRestaurantService = {
  find: jest.fn(),
};
describe('RestaurantsService', () => {
  let service: RestaurantsService;
  let model: Model<Restaurant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getModelToken(Restaurant.name),
          useValue: mockRestaurantService,
        },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
    model = module.get<Model<Restaurant>>(getModelToken(Restaurant.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should get all restaurants', async () => {
      jest.spyOn(model, 'find').mockImplementationOnce(
        () =>
          ({
            limit: () => ({
              skip: jest.fn().mockResolvedValueOnce([mockRestaurant]),
            }),
          }) as any,
      );

      // call the service method
      const restaurants = await service.findAll({ keyword: 'restaurant' });
      expect(restaurants).toEqual([mockRestaurant]);
    });
  });
});
