import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from '../../presentation/controllers/app.controller';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { UsersController } from '../../presentation/controllers/users.controller';
import { GuaranteeChecksController } from '../../presentation/controllers/guarantee-checks.controller';
import { SignupUseCase } from '../../application/use-cases/auth/signup.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { GetProfileUseCase } from '../../application/use-cases/user/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/use-cases/user/update-profile.use-case';
import { CreateGuaranteeCheckUseCase } from '../../application/use-cases/guarantee-check/create-guarantee-check.use-case';
import { GetGuaranteeChecksUseCase } from '../../application/use-cases/guarantee-check/get-guarantee-checks.use-case';
import { GetGuaranteeCheckByIdUseCase } from '../../application/use-cases/guarantee-check/get-guarantee-check-by-id.use-case';
import { UpdateGuaranteeCheckUseCase } from '../../application/use-cases/guarantee-check/update-guarantee-check.use-case';
import { DeleteGuaranteeCheckUseCase } from '../../application/use-cases/guarantee-check/delete-guarantee-check.use-case';
import { GetGuaranteeCheckStatsUseCase } from '../../application/use-cases/guarantee-check/get-guarantee-check-stats.use-case';
import { AuthDomainService } from '../../domain/services/auth.domain.service';
import { UserRepository } from '../repositories/user.repository';
import { GuaranteeCheckRepository } from '../repositories/guarantee-check.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InMemoryDatabase } from '../../persistence/database/in-memory.database';
import { SeedService } from '../../persistence/seed/seed.service';
import { SecurityLogger } from '../logging/security.logger';
import { InputSanitizerService } from '../sanitization/input-sanitizer.service';
import { SanitizationInterceptor } from '../interceptors/sanitization.interceptor';
import { AuthCookieInterceptor } from '../interceptors/auth-cookie.interceptor';
import { FileValidationService } from '../validation/file-validation.service';
import { TokenBlacklistService } from '../auth/token-blacklist.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 10,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1h';
        return {
          secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
          signOptions: {
            expiresIn: expiresIn as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    GuaranteeChecksController,
  ],
  providers: [
    SignupUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
    CreateGuaranteeCheckUseCase,
    GetGuaranteeChecksUseCase,
    GetGuaranteeCheckByIdUseCase,
    UpdateGuaranteeCheckUseCase,
    DeleteGuaranteeCheckUseCase,
    GetGuaranteeCheckStatsUseCase,
    AuthDomainService,
    UserRepository,
    GuaranteeCheckRepository,
    RefreshTokenRepository,
    JwtStrategy,
    JwtAuthGuard,
    InMemoryDatabase,
    SeedService,
    SecurityLogger,
    InputSanitizerService,
    SanitizationInterceptor,
    AuthCookieInterceptor,
    FileValidationService,
    TokenBlacklistService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IGuaranteeCheckRepository',
      useClass: GuaranteeCheckRepository,
    },
    {
      provide: 'IRefreshTokenRepository',
      useClass: RefreshTokenRepository,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [JwtAuthGuard, JwtModule],
})
export class AppModule {}
