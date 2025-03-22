import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { SignupDTO } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  // Register User
  async signUp(signUpDto: SignupDTO): Promise<User> {
    const { name, email, password } = signUpDto;

    const user = await this.userModel.create({
      name,
      email,
      password,
    });

    return user;
  }
}
