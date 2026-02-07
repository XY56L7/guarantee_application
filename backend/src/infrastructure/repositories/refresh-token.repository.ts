import { Injectable } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { InMemoryDatabase } from '../../persistence/database/in-memory.database';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async create(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const refreshToken = new RefreshToken(
      this.db.getNextRefreshTokenId(),
      userId,
      token,
      expiresAt,
      new Date(),
      false,
    );

    this.db.addRefreshToken(refreshToken.toJSON());
    return refreshToken;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const tokenData = this.db.findRefreshTokenByToken(token);
    if (!tokenData) return null;

    return new RefreshToken(
      tokenData.id,
      tokenData.userId,
      tokenData.token,
      new Date(tokenData.expiresAt),
      new Date(tokenData.createdAt),
      tokenData.isRevoked,
    );
  }

  async findByUserId(userId: number): Promise<RefreshToken[]> {
    const tokens = this.db.findRefreshTokensByUserId(userId);
    return tokens.map(
      (t) =>
        new RefreshToken(
          t.id,
          t.userId,
          t.token,
          new Date(t.expiresAt),
          new Date(t.createdAt),
          t.isRevoked,
        ),
    );
  }

  async revokeToken(token: string): Promise<boolean> {
    return this.db.revokeRefreshToken(token);
  }

  async revokeAllUserTokens(userId: number): Promise<number> {
    return this.db.revokeAllUserRefreshTokens(userId);
  }

  async deleteExpired(): Promise<number> {
    return this.db.deleteExpiredRefreshTokens();
  }
}
