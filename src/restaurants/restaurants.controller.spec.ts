/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { PassportModule } from '@nestjs/passport';
import { UserRoles } from '../auth/schemas/user.schema';

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

const mockUser = {
  _id: '67e1e795f51290a8f81db3b1',
  email: 'startae@gmail.com',
  name: 'Simone',
  password: '12345678',
  role: UserRoles.USER,
};

const mockRestaurantService = {
  findAll: jest.fn().mockResolvedValueOnce([mockRestaurant]),
};

describe('RestaurantsController', () => {
  let controller: RestaurantsController;
  let service: RestaurantsService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [RestaurantsController],
      providers: [
        {
          provide: RestaurantsService,
          useValue: mockRestaurantService,
        },
      ],
    }).compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
    service = module.get<RestaurantsService>(RestaurantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllRestaurants', () => {
    it('should get all restaurants', async () => {
      const result = await controller.getAllRestaurants({
        keyword: 'restaurant',
      });

      // check it calls the service
      expect(service.findAll).toHaveBeenCalled();
      // check it returns the result from the service
      expect(result).toEqual([mockRestaurant]);
    });
  });
});
