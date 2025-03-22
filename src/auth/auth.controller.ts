import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup.dto';
import { User } from './schemas/user.schema';
import { LoginDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Register a new user
  @Post('/signup')
  signUp(@Body() signUpDto: SignupDTO): Promise<User> {
    return this.authService.signUp(signUpDto);
  }

  // Login user
  @Get('/login')
  login(@Body() loginDto: LoginDTO): Promise<User> {
    return this.authService.login(loginDto);
  }
}
