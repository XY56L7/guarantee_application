import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}

export class UserResponseDto {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
}
