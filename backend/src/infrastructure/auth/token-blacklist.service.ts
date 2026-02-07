import { Injectable } from '@nestjs/common';

interface BlacklistedToken {
  token: string;
  expiresAt: Date;
}

@Injectable()
export class TokenBlacklistService {
  private blacklist: Map<string, Date> = new Map();

  async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
    this.blacklist.set(token, expiresAt);
    this.cleanupExpired();
  }

  async isBlacklisted(token: string): Promise<boolean> {
    this.cleanupExpired();
    return this.blacklist.has(token);
  }

  async removeFromBlacklist(token: string): Promise<void> {
    this.blacklist.delete(token);
  }

  private cleanupExpired(): void {
    const now = new Date();
    for (const [token, expiresAt] of this.blacklist.entries()) {
      if (expiresAt < now) {
        this.blacklist.delete(token);
      }
    }
  }

  async clearAll(): Promise<void> {
    this.blacklist.clear();
  }

  getSize(): number {
    this.cleanupExpired();
    return this.blacklist.size;
  }
}
