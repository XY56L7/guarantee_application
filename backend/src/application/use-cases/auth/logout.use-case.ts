import { Injectable, Inject } from '@nestjs/common';
import { LogoutDto } from '../../dto/auth.dto';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { TokenBlacklistService } from '../../../infrastructure/auth/token-blacklist.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LogoutDto, accessToken?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const refreshToken = dto.refreshToken || '';
    try {
      if (refreshToken) {
        const refreshPayload = this.jwtService.decode(refreshToken) as any;
        if (refreshPayload && refreshPayload.exp) {
          const expiresAt = new Date(refreshPayload.exp * 1000);
          await this.tokenBlacklistService.addToBlacklist(
            refreshToken,
            expiresAt,
          );
        }
      }
    } catch (error) {
    }

    if (accessToken) {
      try {
        const accessPayload = this.jwtService.decode(accessToken) as any;
        if (accessPayload && accessPayload.exp) {
          const expiresAt = new Date(accessPayload.exp * 1000);
          await this.tokenBlacklistService.addToBlacklist(
            accessToken,
            expiresAt,
          );
        }
      } catch (error) {
      }
    }

    if (refreshToken) {
      await this.refreshTokenRepository.revokeToken(refreshToken);
    }

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
