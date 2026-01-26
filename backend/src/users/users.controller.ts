import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UpdateProfileDto, UserResponseDto } from '../application/dto/user.dto';
import { GetProfileUseCase } from '../application/use-cases/user/get-profile.use-case';
import { UpdateProfileUseCase } from '../application/use-cases/user/update-profile.use-case';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
  ) {}

  @Get('profile')
  async getProfile(@Request() req): Promise<{ success: boolean; user: UserResponseDto }> {
    const user = await this.getProfileUseCase.execute(req.user.userId);
    return {
      success: true,
      user,
    };
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() dto: UpdateProfileDto,
  ): Promise<{ success: boolean; message: string; user: UserResponseDto }> {
    const user = await this.updateProfileUseCase.execute(req.user.userId, dto);
    return {
      success: true,
      message: 'Profile updated successfully',
      user,
    };
  }

  @Get()
  async getAllUsers(@Request() req): Promise<{ success: boolean; count: number; users: UserResponseDto[] }> {
    return {
      success: true,
      count: 0,
      users: [],
    };
  }
}
