import { AuthDomainService } from './auth.domain.service';

describe('AuthDomainService', () => {
  let service: AuthDomainService;

  beforeEach(() => {
    service = new AuthDomainService();
  });

  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(service.validateEmail('user@example.com')).toBe(true);
      expect(service.validateEmail('test.user@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(service.validateEmail('invalid')).toBe(false);
      expect(service.validateEmail('missing@domain')).toBe(false);
      expect(service.validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for password with 6+ characters', () => {
      expect(service.validatePassword('123456')).toBe(true);
      expect(service.validatePassword('password')).toBe(true);
    });

    it('should return false for short or empty password', () => {
      expect(service.validatePassword('12345')).toBe(false);
      expect(service.validatePassword('')).toBeFalsy();
    });
  });

  describe('validateUserData', () => {
    it('should not throw for valid email and password', () => {
      expect(() =>
        service.validateUserData('user@example.com', 'password123'),
      ).not.toThrow();
    });

    it('should throw when email is missing', () => {
      expect(() => service.validateUserData('', 'password123')).toThrow(
        'Email and password are required',
      );
    });

    it('should throw when password is missing', () => {
      expect(() => service.validateUserData('user@example.com', '')).toThrow(
        'Email and password are required',
      );
    });

    it('should throw for invalid email format', () => {
      expect(() =>
        service.validateUserData('invalid-email', 'password123'),
      ).toThrow('Invalid email format');
    });

    it('should throw for short password', () => {
      expect(() =>
        service.validateUserData('user@example.com', '12345'),
      ).toThrow('Password must be at least 6 characters long');
    });

    it('should throw when name is provided but empty (whitespace)', () => {
      expect(() =>
        service.validateUserData('user@example.com', 'password123', '   '),
      ).toThrow('Name cannot be empty');
    });

    it('should not throw when name is valid', () => {
      expect(() =>
        service.validateUserData('user@example.com', 'password123', 'John'),
      ).not.toThrow();
    });
  });
});
