import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  Res,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import {
  SignupDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  LogoutDto,
} from '../../application/dto/auth.dto';
import { SignupUseCase } from '../../application/use-cases/auth/signup.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import {
  AuthCookieInterceptor,
  clearAuthCookies,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../../infrastructure/interceptors/auth-cookie.interceptor';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('signup')
  @UseInterceptors(AuthCookieInterceptor)
  async signup(@Body() dto: SignupDto): Promise<AuthResponseDto> {
    return await this.signupUseCase.execute(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @UseInterceptors(AuthCookieInterceptor)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return await this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @UseInterceptors(AuthCookieInterceptor)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Request() req: { cookies?: { [key: string]: string } },
  ): Promise<RefreshTokenResponseDto> {
    const refreshToken =
      dto?.refreshToken || req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token required (cookie or body)',
      );
    }
    return await this.refreshTokenUseCase.execute({ refreshToken });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Body() dto: LogoutDto,
    @Headers('authorization') auth: string,
    @Request() req: { cookies?: { [key: string]: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken =
      auth?.split(' ')[1] ?? req.cookies?.[ACCESS_TOKEN_COOKIE];
    const refreshToken =
      dto?.refreshToken ?? req.cookies?.[REFRESH_TOKEN_COOKIE] ?? '';
    const result = await this.logoutUseCase.execute(
      { refreshToken },
      accessToken,
    );
    clearAuthCookies(res);
    return result;
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
