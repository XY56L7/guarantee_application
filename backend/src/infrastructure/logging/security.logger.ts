import { Injectable, Logger } from '@nestjs/common';

interface SecurityEvent {
  type: string;
  timestamp: Date;
  details: Record<string, any>;
}

@Injectable()
export class SecurityLogger {
  private readonly logger = new Logger('Security');
  private events: SecurityEvent[] = [];

  logFailedLogin(email: string, reason: string): void {
    const event: SecurityEvent = {
      type: 'FAILED_LOGIN',
      timestamp: new Date(),
      details: { email, reason },
    };
    this.events.push(event);
    this.logger.warn(`Failed login attempt: ${email} - ${reason}`);
  }

  logSuccessfulLogin(email: string): void {
    const event: SecurityEvent = {
      type: 'SUCCESSFUL_LOGIN',
      timestamp: new Date(),
      details: { email },
    };
    this.events.push(event);
    this.logger.log(`Successful login: ${email}`);
  }

  logTokenValidationFailure(token: string, reason: string): void {
    const event: SecurityEvent = {
      type: 'TOKEN_VALIDATION_FAILURE',
      timestamp: new Date(),
      details: { reason },
    };
    this.events.push(event);
    this.logger.warn(`Token validation failed: ${reason}`);
  }

  logRateLimitHit(ip: string, endpoint: string): void {
    const event: SecurityEvent = {
      type: 'RATE_LIMIT_HIT',
      timestamp: new Date(),
      details: { ip, endpoint },
    };
    this.events.push(event);
    this.logger.warn(`Rate limit hit: ${ip} on ${endpoint}`);
  }

  logAccountLocked(email: string): void {
    const event: SecurityEvent = {
      type: 'ACCOUNT_LOCKED',
      timestamp: new Date(),
      details: { email },
    };
    this.events.push(event);
    this.logger.warn(`Account locked: ${email}`);
  }

  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByType(type: string): SecurityEvent[] {
    return this.events.filter((e) => e.type === type);
  }
}
