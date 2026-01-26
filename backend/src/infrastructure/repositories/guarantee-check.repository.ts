import { Injectable } from '@nestjs/common';
import { IGuaranteeCheckRepository } from '../../domain/repositories/guarantee-check.repository.interface';
import { GuaranteeCheck } from '../../domain/entities/guarantee-check.entity';
import { InMemoryDatabase } from '../../persistence/database/in-memory.database';

@Injectable()
export class GuaranteeCheckRepository implements IGuaranteeCheckRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async findAllByUserId(userId: number): Promise<GuaranteeCheck[]> {
    const checks = this.db.findGuaranteeChecksByUserId(userId);
    return checks.map(
      (check) => new GuaranteeCheck(
        check.id,
        check.userId,
        check.storeName,
        check.productName,
        check.purchaseDate,
        check.expiryDate,
        check.imagePath,
        check.notes,
        check.createdAt
      )
    );
  }

  async findById(id: number): Promise<GuaranteeCheck | null> {
    const checkData = this.db.findGuaranteeCheckById(id);
    return checkData
      ? new GuaranteeCheck(
          checkData.id,
          checkData.userId,
          checkData.storeName,
          checkData.productName,
          checkData.purchaseDate,
          checkData.expiryDate,
          checkData.imagePath,
          checkData.notes,
          checkData.createdAt
        )
      : null;
  }

  async findByUserIdAndId(
    userId: number,
    id: number,
  ): Promise<GuaranteeCheck | null> {
    const check = await this.findById(id);
    if (check && check.userId === userId) {
      return check;
    }
    return null;
  }

  async create(
    checkData: Partial<GuaranteeCheck>,
  ): Promise<GuaranteeCheck> {
    const newCheck = {
      id: this.db.getNextGuaranteeCheckId(),
      userId: checkData.userId!,
      storeName: checkData.storeName!,
      productName: checkData.productName!,
      purchaseDate: checkData.purchaseDate!,
      expiryDate: checkData.expiryDate!,
      imagePath: checkData.imagePath!,
      notes: checkData.notes || null,
      createdAt: new Date(),
    };
    this.db.addGuaranteeCheck(newCheck);
    return new GuaranteeCheck(
      newCheck.id,
      newCheck.userId,
      newCheck.storeName,
      newCheck.productName,
      newCheck.purchaseDate,
      newCheck.expiryDate,
      newCheck.imagePath,
      newCheck.notes,
      newCheck.createdAt
    );
  }

  async update(
    id: number,
    updates: Partial<GuaranteeCheck>,
  ): Promise<GuaranteeCheck | null> {
    const updatedCheck = this.db.updateGuaranteeCheck(id, updates);
    return updatedCheck
      ? new GuaranteeCheck(
          updatedCheck.id,
          updatedCheck.userId,
          updatedCheck.storeName,
          updatedCheck.productName,
          updatedCheck.purchaseDate,
          updatedCheck.expiryDate,
          updatedCheck.imagePath,
          updatedCheck.notes,
          updatedCheck.createdAt
        )
      : null;
  }

  async delete(id: number): Promise<boolean> {
    return this.db.deleteGuaranteeCheck(id);
  }

  async getStatsByUserId(userId: number): Promise<{
    total: number;
    expired: number;
    expiringSoon: number;
    valid: number;
  }> {
    const checks = await this.findAllByUserId(userId);
    const expired = checks.filter((check) => check.isExpired());
    const expiringSoon = checks.filter((check) => check.expiresSoon());
    const valid = checks.length - expired.length - expiringSoon.length;

    return {
      total: checks.length,
      expired: expired.length,
      expiringSoon: expiringSoon.length,
      valid: valid,
    };
  }
}
