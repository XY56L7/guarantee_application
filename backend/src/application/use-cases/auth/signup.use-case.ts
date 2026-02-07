import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SignupDto, AuthResponseDto } from '../../dto/auth.dto';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IRefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository.interface';
import { AuthDomainService } from '../../../domain/services/auth.domain.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly authDomainService: AuthDomainService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: SignupDto): Promise<AuthResponseDto> {
    this.authDomainService.validateUserData(dto.email, dto.password, dto.name);

    const exists = await this.userRepository.exists(dto.email);
    if (exists) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      name: dto.name,
    } as any);

    const accessTokenExpiry =
      this.configService.get<string>('JWT_ACCESS_EXPIRY') || '15m';
    const refreshTokenExpiry =
      this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d';

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
      message: 'User created successfully',
      user: user.toPublicJSON(),
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}
