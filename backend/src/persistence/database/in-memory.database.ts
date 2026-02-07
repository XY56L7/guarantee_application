import { Injectable } from '@nestjs/common';

interface UserData {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
}

interface GuaranteeCheckData {
  id: number;
  userId: number;
  storeName: string;
  productName: string;
  purchaseDate: string;
  expiryDate: string;
  imagePath: string;
  notes: string | null;
  createdAt: Date;
}

interface RefreshTokenData {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
}

@Injectable()
export class InMemoryDatabase {
  private users: UserData[] = [];
  private guaranteeChecks: GuaranteeCheckData[] = [];
  private refreshTokens: RefreshTokenData[] = [];

  getUsers(): UserData[] {
    return this.users;
  }

  setUsers(users: UserData[]): void {
    this.users = users;
  }

  addUser(user: UserData): void {
    this.users.push(user);
  }

  findUserById(id: number): UserData | undefined {
    return this.users.find((u) => u.id === id);
  }

  findUserByEmail(email: string): UserData | undefined {
    return this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
  }

  updateUser(id: number, updates: Partial<UserData>): UserData | null {
    const index = this.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      return this.users[index];
    }
    return null;
  }

  getNextUserId(): number {
    return this.users.length > 0
      ? Math.max(...this.users.map((u) => u.id)) + 1
      : 1;
  }

  incrementFailedLoginAttempts(email: string): void {
    const user = this.findUserByEmail(email);
    if (user) {
      const index = this.users.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        this.users[index].failedLoginAttempts =
          (this.users[index].failedLoginAttempts || 0) + 1;
        if (this.users[index].failedLoginAttempts! >= 5) {
          const lockDuration = 15 * 60 * 1000;
          this.users[index].lockedUntil = new Date(Date.now() + lockDuration);
        }
      }
    }
  }

  resetFailedLoginAttempts(email: string): void {
    const user = this.findUserByEmail(email);
    if (user) {
      const index = this.users.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        this.users[index].failedLoginAttempts = 0;
        this.users[index].lockedUntil = undefined;
      }
    }
  }

  isAccountLocked(email: string): boolean {
    const user = this.findUserByEmail(email);
    if (!user || !user.lockedUntil) {
      return false;
    }
    if (user.lockedUntil > new Date()) {
      return true;
    }
    this.resetFailedLoginAttempts(email);
    return false;
  }

  getGuaranteeChecks(): GuaranteeCheckData[] {
    return this.guaranteeChecks;
  }

  setGuaranteeChecks(checks: GuaranteeCheckData[]): void {
    this.guaranteeChecks = checks;
  }

  addGuaranteeCheck(check: GuaranteeCheckData): void {
    this.guaranteeChecks.push(check);
  }

  findGuaranteeCheckById(id: number): GuaranteeCheckData | undefined {
    return this.guaranteeChecks.find((c) => c.id === id);
  }

  findGuaranteeChecksByUserId(userId: number): GuaranteeCheckData[] {
    return this.guaranteeChecks.filter((c) => c.userId === userId);
  }

  updateGuaranteeCheck(
    id: number,
    updates: Partial<GuaranteeCheckData>,
  ): GuaranteeCheckData | null {
    const index = this.guaranteeChecks.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.guaranteeChecks[index] = {
        ...this.guaranteeChecks[index],
        ...updates,
      };
      return this.guaranteeChecks[index];
    }
    return null;
  }

  deleteGuaranteeCheck(id: number): boolean {
    const index = this.guaranteeChecks.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.guaranteeChecks.splice(index, 1);
      return true;
    }
    return false;
  }

  getNextGuaranteeCheckId(): number {
    return this.guaranteeChecks.length > 0
      ? Math.max(...this.guaranteeChecks.map((c) => c.id)) + 1
      : 1;
  }

  addRefreshToken(token: RefreshTokenData): void {
    this.refreshTokens.push(token);
  }

  getNextRefreshTokenId(): number {
    return this.refreshTokens.length > 0
      ? Math.max(...this.refreshTokens.map((t) => t.id)) + 1
      : 1;
  }

  findRefreshTokenByToken(token: string): RefreshTokenData | undefined {
    return this.refreshTokens.find((t) => t.token === token);
  }

  findRefreshTokensByUserId(userId: number): RefreshTokenData[] {
    return this.refreshTokens.filter((t) => t.userId === userId);
  }

  revokeRefreshToken(token: string): boolean {
    const index = this.refreshTokens.findIndex((t) => t.token === token);
    if (index !== -1) {
      this.refreshTokens[index].isRevoked = true;
      return true;
    }
    return false;
  }

  revokeAllUserRefreshTokens(userId: number): number {
    let count = 0;
    this.refreshTokens.forEach((t) => {
      if (t.userId === userId && !t.isRevoked) {
        t.isRevoked = true;
        count++;
      }
    });
    return count;
  }

  deleteExpiredRefreshTokens(): number {
    const now = new Date();
    const initialLength = this.refreshTokens.length;
    this.refreshTokens = this.refreshTokens.filter((t) => t.expiresAt > now);
    return initialLength - this.refreshTokens.length;
  }
}
