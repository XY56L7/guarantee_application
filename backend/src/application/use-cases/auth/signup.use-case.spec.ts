import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupUseCase } from './signup.use-case';
import { AuthDomainService } from '../../../domain/services/auth.domain.service';
import { User } from '../../../domain/entities/user.entity';

jest.mock('bcrypt');

describe('SignupUseCase', () => {
  let signupUseCase: SignupUseCase;
  let userRepository: { exists: jest.Mock; create: jest.Mock };
  let jwtService: { sign: jest.Mock };

  const mockUser = new User(
    1,
    'user@example.com',
    'hashed',
    'Test User',
    new Date(),
  );

  beforeEach(async () => {
    userRepository = {
      exists: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockResolvedValue(mockUser),
    };
    jwtService = { sign: jest.fn().mockReturnValue('jwt-token') };
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupUseCase,
        AuthDomainService,
        { provide: 'IUserRepository', useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    signupUseCase = module.get<SignupUseCase>(SignupUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(signupUseCase).toBeDefined();
  });

  it('should create user and return token', async () => {
    const dto = {
      email: 'user@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const result = await signupUseCase.execute(dto);

    expect(result.success).toBe(true);
    expect(result.token).toBe('jwt-token');
    expect(result.user.email).toBe('user@example.com');
    expect(userRepository.exists).toHaveBeenCalledWith('user@example.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'hashed-password',
      name: 'Test User',
    });
  });

  it('should throw ConflictException when email already exists', async () => {
    userRepository.exists.mockResolvedValue(true);

    await expect(
      signupUseCase.execute({
        email: 'existing@example.com',
        password: 'password123',
        name: 'User',
      }),
    ).rejects.toThrow(ConflictException);

    expect(userRepository.exists).toHaveBeenCalledWith('existing@example.com');
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should throw when validation fails', async () => {
    await expect(
      signupUseCase.execute({
        email: 'invalid',
        password: 'short',
        name: 'User',
      }),
    ).rejects.toThrow();

    expect(userRepository.exists).not.toHaveBeenCalled();
  });
});
