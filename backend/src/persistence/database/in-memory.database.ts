import { Injectable } from '@nestjs/common';

interface UserData {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
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

@Injectable()
export class InMemoryDatabase {
  private users: UserData[] = [];
  private guaranteeChecks: GuaranteeCheckData[] = [];

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
}
