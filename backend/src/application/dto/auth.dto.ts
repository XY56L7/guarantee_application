import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthResponseDto {
  success: boolean;
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    createdAt: Date;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class RefreshTokenResponseDto {
  success: boolean;
  accessToken: string;
  expiresIn: number;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
