import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SignupDto, LoginDto, AuthResponseDto } from '../../application/dto/auth.dto';
import { SignupUseCase } from '../../application/use-cases/auth/signup.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto): Promise<AuthResponseDto> {
    return await this.signupUseCase.execute(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return await this.loginUseCase.execute(dto);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Request() req) {
    return {
      success: true,
      message: 'Token is valid',
      user: req.user,
    };
  }
}
