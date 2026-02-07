import { RefreshToken } from '../entities/refresh-token.entity';

export interface IRefreshTokenRepository {
  create(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken>;
  findByToken(token: string): Promise<RefreshToken | null>;
  findByUserId(userId: number): Promise<RefreshToken[]>;
  revokeToken(token: string): Promise<boolean>;
  revokeAllUserTokens(userId: number): Promise<number>;
  deleteExpired(): Promise<number>;
}
