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
    it('should return true for password with 8+ characters and complexity', () => {
      expect(service.validatePassword('Password123!')).toBe(true);
      expect(service.validatePassword('SecurePass1@')).toBe(true);
    });

    it('should return false for short password', () => {
      expect(service.validatePassword('12345')).toBe(false);
      expect(service.validatePassword('Pass1!')).toBe(false);
    });

    it('should return false for password without uppercase', () => {
      expect(service.validatePassword('password123!')).toBe(false);
    });

    it('should return false for password without lowercase', () => {
      expect(service.validatePassword('PASSWORD123!')).toBe(false);
    });

    it('should return false for password without numbers', () => {
      expect(service.validatePassword('Password!')).toBe(false);
    });

    it('should return false for password without special characters', () => {
      expect(service.validatePassword('Password123')).toBe(false);
    });

    it('should return false for empty password', () => {
      expect(service.validatePassword('')).toBeFalsy();
    });
  });

  describe('validateUserData', () => {
    it('should not throw for valid email and password', () => {
      expect(() =>
        service.validateUserData('user@example.com', 'Password123!'),
      ).not.toThrow();
    });

    it('should throw when email is missing', () => {
      expect(() => service.validateUserData('', 'Password123!')).toThrow(
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
        service.validateUserData('invalid-email', 'Password123!'),
      ).toThrow('Invalid email format');
    });

    it('should throw for short password', () => {
      expect(() =>
        service.validateUserData('user@example.com', '12345'),
      ).toThrow(
        'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters',
      );
    });

    it('should throw when name is provided but empty (whitespace)', () => {
      expect(() =>
        service.validateUserData('user@example.com', 'Password123!', '   '),
      ).toThrow('Name cannot be empty');
    });

    it('should not throw when name is valid', () => {
      expect(() =>
        service.validateUserData('user@example.com', 'Password123!', 'John'),
      ).not.toThrow();
    });
  });
});
