import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { SignupUseCase } from '../../application/use-cases/auth/signup.use-case';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { SecurityLogger } from '../../infrastructure/logging/security.logger';

describe('AuthController', () => {
  let controller: AuthController;
  let signupUseCase: { execute: jest.Mock };
  let loginUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    signupUseCase = { execute: jest.fn() };
    loginUseCase = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: SignupUseCase, useValue: signupUseCase },
        { provide: LoginUseCase, useValue: loginUseCase },
        { provide: JwtService, useValue: { verify: jest.fn(), sign: jest.fn() } },
        { provide: SecurityLogger, useValue: new SecurityLogger() },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call signup use case and return result', async () => {
      const dto = {
        email: 'user@example.com',
        password: 'Password123!',
        name: 'Test User',
      };
      const expected = { success: true, user: {}, token: 'token' };
      signupUseCase.execute.mockResolvedValue(expected);

      const result = await controller.signup(dto);

      expect(signupUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call login use case and return result', async () => {
      const dto = { email: 'user@example.com', password: 'Password123!' };
      const expected = { success: true, user: {}, token: 'token' };
      loginUseCase.execute.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(loginUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('verify', () => {
    it('should return success when guard passes', async () => {
      const req = { user: { userId: 1, email: 'user@example.com' } };

      const result = await controller.verify(req);

      expect(result).toEqual({
        success: true,
        message: 'Token is valid',
        user: req.user,
      });
    });
  });
});
