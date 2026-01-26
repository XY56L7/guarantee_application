import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { SignupUseCase } from '../application/use-cases/auth/signup.use-case';
import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { AuthDomainService } from '../domain/services/auth.domain.service';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { InMemoryDatabase } from '../persistence/database/in-memory.database';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    SignupUseCase,
    LoginUseCase,
    AuthDomainService,
    UserRepository,
    JwtStrategy,
    JwtAuthGuard,
    InMemoryDatabase,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
