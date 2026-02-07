import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './login.use-case';
import { AuthDomainService } from '../../../domain/services/auth.domain.service';
import { User } from '../../../domain/entities/user.entity';
import { InMemoryDatabase } from '../../../persistence/database/in-memory.database';
import { SecurityLogger } from '../../../infrastructure/logging/security.logger';

jest.mock('bcrypt');

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let userRepository: { findByEmail: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let db: InMemoryDatabase;
  let securityLogger: SecurityLogger;

  const mockUser = new User(
    1,
    'user@example.com',
    '$2b$10$hashed',
    'Test User',
    new Date(),
  );

  beforeEach(async () => {
    userRepository = { findByEmail: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('jwt-token') };
    db = new InMemoryDatabase();
    securityLogger = new SecurityLogger();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        AuthDomainService,
        { provide: 'IUserRepository', useValue: userRepository },
        {
          provide: 'IRefreshTokenRepository',
          useValue: { create: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: JwtService, useValue: jwtService },
        { provide: InMemoryDatabase, useValue: db },
        { provide: SecurityLogger, useValue: securityLogger },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => (key === 'JWT_ACCESS_EXPIRY' ? '15m' : key === 'JWT_REFRESH_EXPIRY' ? '7d' : undefined)) },
        },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(loginUseCase).toBeDefined();
  });

  it('should return token and user on valid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await loginUseCase.execute({
      email: 'user@example.com',
      password: 'Password123!',
    });

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('jwt-token');
    expect(result.user.email).toBe('user@example.com');
    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'Password123!',
      mockUser.password,
    );
  });

  it('should throw UnauthorizedException when user not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'unknown@example.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'unknown@example.com',
    );
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password is wrong', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      loginUseCase.execute({
        email: 'user@example.com',
        password: 'WrongPass123!',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'WrongPass123!',
      mockUser.password,
    );
  });

  it('should throw when email/password validation fails', async () => {
    await expect(
      loginUseCase.execute({
        email: '',
        password: 'Password123!',
      }),
    ).rejects.toThrow('Email and password are required');

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });
});
