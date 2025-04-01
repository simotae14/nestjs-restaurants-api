/* eslint-disable @typescript-eslint/no-unsafe-return */
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './schemas/restaurant.schema';
import { User, UserRoles } from '../auth/schemas/user.schema';
import APIFeatures from './utils/apiFeatures.utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
  find: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
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

  describe('create', () => {
    const newRestaurant = {
      category: 'Fast Food',
      name: 'Retaurant fast food 2',
      address: '200 Olympic Dr, Stafford, VS, 22554',
      phoneNo: 9788246116,
      email: 'ghulam@gamil.com',
      description: 'This is just a description',
    };

    it('should create a new restaurant', async () => {
      jest
        .spyOn(APIFeatures, 'getRestaurantLocation')
        .mockImplementationOnce(() => Promise.resolve(mockRestaurant.location));

      jest
        .spyOn(model, 'create')
        .mockImplementationOnce(() => Promise.resolve(mockRestaurant as any));

      const result = await service.create(
        newRestaurant as Restaurant,
        mockUser as User,
      );

      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('findById', () => {
    it('should get restaurant by Id', async () => {
      jest
        .spyOn(model, 'findById')
        .mockResolvedValueOnce(mockRestaurant as any);

      const result = await service.findById(mockRestaurant._id);

      expect(result).toEqual(mockRestaurant);
    });

    it('should throw mongoose id error', async () => {
      await expect(service.findById('wrongId')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw restaurant not found error', async () => {
      const mockError = new NotFoundException('Restaurant not found.');
      jest.spyOn(model, 'findById').mockRejectedValue(mockError);

      await expect(service.findById(mockRestaurant._id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateById', () => {
    it('should update the restaurant', async () => {
      const restaurant = {
        ...mockRestaurant,
        name: 'Updated name',
      };
      const updateRestaurant = {
        name: 'Updated name',
      };

      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockResolvedValueOnce(restaurant as any);

      const updatedRestaurant = await service.updateById(
        restaurant._id,
        updateRestaurant as Restaurant,
      );

      expect(updatedRestaurant?.name).toEqual(restaurant.name);
    });
  });

  describe('deleteById', () => {
    it('should delete the restaurant', async () => {
      jest
        .spyOn(model, 'findByIdAndDelete')
        .mockResolvedValueOnce(mockRestaurant);

      const result = await service.deleteById(mockRestaurant._id);

      expect(result).toEqual(mockRestaurant);
    });
  });

  describe('uploadImages', () => {
    it('should upload restaurant images on S3 bucket', async () => {
      const mockImages = [
        {
          ETag: '"0b788687d942457e754e3f88610f0941"',
          ServerSideEncryption: 'AES256',
          Location:
            'https://nestjs-restaurant-api-tae.s3.amazonaws.com/restaurants/moss_1743548001866.jpeg',
          key: 'restaurants/moss_1743548001866.jpeg',
          Key: 'restaurants/moss_1743548001866.jpeg',
          Bucket: 'nestjs-restaurant-api-tae',
        },
      ];

      const updatedRestaurant = {
        ...mockRestaurant,
        images: mockImages,
      };

      jest.spyOn(APIFeatures, 'uploadImages').mockResolvedValueOnce(mockImages);

      jest
        .spyOn(model, 'findByIdAndUpdate')
        .mockResolvedValueOnce(updatedRestaurant as any);

      const files = [
        {
          fieldname: 'files',
          originalname: 'moss_1743548001866.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 123456,
          buffer:
            '<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff db 00 43 00 0c 08 08 08 09 08 0c 0b 0a 0b 0e 0d 0c 0e 12 1a 12 12 11 11 12 24 18 19 15 1a 2d 24 ... 123406 more bytes>',
        },
      ];
      const result = await service.uploadImages(mockRestaurant._id, files);

      expect(result).toEqual(updatedRestaurant);
    });
  });

  describe('deleteImages', () => {
    it('should delete restaurant images from S3 bucket', async () => {
      const mockImages = [
        {
          ETag: '"0b788687d942457e754e3f88610f0941"',
          ServerSideEncryption: 'AES256',
          Location:
            'https://nestjs-restaurant-api-tae.s3.amazonaws.com/restaurants/moss_1743548001866.jpeg',
          key: 'restaurants/moss_1743548001866.jpeg',
          Key: 'restaurants/moss_1743548001866.jpeg',
          Bucket: 'nestjs-restaurant-api-tae',
        },
      ];

      jest.spyOn(APIFeatures, 'deleteImages').mockResolvedValueOnce(true);

      const result = await service.deleteImages(mockImages);

      expect(result).toBe(true);
    });
  });
});
