import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthDomainService {
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePassword(password: string): boolean {
    return password && password.length >= 6;
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
      throw new Error('Password must be at least 6 characters long');
    }
  }
}
