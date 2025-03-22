/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { SignupDTO } from './dto/signup.dto';

import * as bcrypt from 'bcryptjs';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  // Register User
  async signUp(signUpDto: SignupDTO): Promise<User> {
    const { name, email, password } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
      });

      return user;
    } catch (error) {
      // Handle duplicate email
      if (error?.cause?.code === 11000) {
        throw new ConflictException('Duplicate Email entered.');
      } else {
        throw new Error('User registration failed.'); // Ensure an error is thrown
      }
    }
  }

  // Login User
  async login(loginDto: LoginDTO): Promise<User> {
    const { email, password } = loginDto;

    // search for user
    const user = await this.userModel.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid email address or password.');
    }

    // Check if password is correct or not
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email address or password.');
    }

    return user;
  }
}
