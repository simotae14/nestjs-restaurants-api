import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  @IsEmail(
    {},
    {
      message: 'Please enter correct email address',
    },
  )
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
