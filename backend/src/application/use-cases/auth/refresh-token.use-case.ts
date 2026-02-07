import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RefreshTokenDto, RefreshTokenResponseDto } from '../../dto/auth.dto';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { TokenBlacklistService } from '../../../infrastructure/auth/token-blacklist.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(
      dto.refreshToken,
    );
    if (isBlacklisted) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    let payload;
    try {
      payload = this.jwtService.verify(dto.refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const storedToken = await this.refreshTokenRepository.findByToken(
      dto.refreshToken,
    );
    if (!storedToken || !storedToken.isValid()) {
      throw new UnauthorizedException('Refresh token not found or revoked');
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const accessTokenExpiry =
      this.configService.get<string>('JWT_ACCESS_EXPIRY') || '15m';

    const newAccessToken = this.jwtService.sign(
      {
        jti: randomUUID(),
        userId: user.id,
        email: user.email,
        name: user.name,
        type: 'access',
      },
      { expiresIn: accessTokenExpiry } as any,
    );

    return {
      success: true,
      accessToken: newAccessToken,
      expiresIn: 900,
    };
  }
}
