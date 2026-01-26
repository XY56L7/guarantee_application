import { User } from '../entities/user.entity';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: Partial<User>): Promise<User>;
  update(id: number, updates: Partial<User>): Promise<User | null>;
  exists(email: string): Promise<boolean>;
}
