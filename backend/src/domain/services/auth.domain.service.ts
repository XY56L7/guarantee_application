import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthDomainService {
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password: string): boolean {
    if (!password || password.length < 8) {
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password,
    );
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  }

  validateUserData(email: string, password: string, name?: string): void {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (name && !name.trim()) {
      throw new Error('Name cannot be empty');
    }

    if (!this.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!this.validatePassword(password)) {
      throw new Error(
        'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters',
      );
    }
  }
}
