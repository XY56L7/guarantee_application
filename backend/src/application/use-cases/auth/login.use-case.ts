import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LoginDto, AuthResponseDto } from '../../dto/auth.dto';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { AuthDomainService } from '../../../domain/services/auth.domain.service';
import { InMemoryDatabase } from '../../../persistence/database/in-memory.database';
import { SecurityLogger } from '../../../infrastructure/logging/security.logger';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly authDomainService: AuthDomainService,
    private readonly jwtService: JwtService,
    private readonly db: InMemoryDatabase,
    private readonly securityLogger: SecurityLogger,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    this.authDomainService.validateUserData(dto.email, dto.password);

    if (this.db.isAccountLocked(dto.email)) {
      this.securityLogger.logFailedLogin(dto.email, 'Account locked');
      throw new UnauthorizedException(
        'Account is temporarily locked due to too many failed login attempts. Please try again later.',
      );
    }

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      this.db.incrementFailedLoginAttempts(dto.email);
      this.securityLogger.logFailedLogin(dto.email, 'User not found');
      throw new UnauthorizedException('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(dto.password, user.password);
    if (!validPassword) {
      this.db.incrementFailedLoginAttempts(dto.email);
      this.securityLogger.logFailedLogin(dto.email, 'Invalid password');
      throw new UnauthorizedException('Invalid email or password');
    }

    this.db.resetFailedLoginAttempts(dto.email);
    this.securityLogger.logSuccessfulLogin(dto.email);

    const accessTokenExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRY') || '15m';
    const refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d';

    const accessToken = this.jwtService.sign(
      {
        jti: randomUUID(),
        userId: user.id,
        email: user.email,
        name: user.name,
        type: 'access',
      },
      { expiresIn: accessTokenExpiry } as any,
    );

    const refreshToken = this.jwtService.sign(
      {
        jti: randomUUID(),
        userId: user.id,
        type: 'refresh',
      },
      { expiresIn: refreshTokenExpiry } as any,
    );

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    await this.refreshTokenRepository.create(
      user.id,
      refreshToken,
      refreshExpiresAt,
    );

    return {
      success: true,
      message: 'Login successful',
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}
