import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { InMemoryDatabase } from '../../persistence/database/in-memory.database';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async findAll(): Promise<User[]> {
    return this.db.getUsers().map((user) => 
      new User(user.id, user.email, user.password, user.name, user.createdAt)
    );
  }

  async findById(id: number): Promise<User | null> {
    const userData = this.db.findUserById(id);
    return userData 
      ? new User(userData.id, userData.email, userData.password, userData.name, userData.createdAt)
      : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = this.db.findUserByEmail(email);
    return userData 
      ? new User(userData.id, userData.email, userData.password, userData.name, userData.createdAt)
      : null;
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = {
      id: this.db.getNextUserId(),
      email: userData.email!,
      password: userData.password!,
      name: userData.name!,
      createdAt: new Date(),
    };
    this.db.addUser(newUser);
    return new User(newUser.id, newUser.email, newUser.password, newUser.name, newUser.createdAt);
  }

  async update(id: number, updates: Partial<User>): Promise<User | null> {
    const updatedUser = this.db.updateUser(id, updates);
    return updatedUser 
      ? new User(updatedUser.id, updatedUser.email, updatedUser.password, updatedUser.name, updatedUser.createdAt)
      : null;
  }

  async exists(email: string): Promise<boolean> {
    return this.db.findUserByEmail(email) !== undefined;
  }
}
