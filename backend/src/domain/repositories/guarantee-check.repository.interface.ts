import { GuaranteeCheck } from '../entities/guarantee-check.entity';

export interface IGuaranteeCheckRepository {
  findAllByUserId(userId: number): Promise<GuaranteeCheck[]>;
  findById(id: number): Promise<GuaranteeCheck | null>;
  findByUserIdAndId(userId: number, id: number): Promise<GuaranteeCheck | null>;
  create(checkData: Partial<GuaranteeCheck>): Promise<GuaranteeCheck>;
  update(
    id: number,
    updates: Partial<GuaranteeCheck>,
  ): Promise<GuaranteeCheck | null>;
  delete(id: number): Promise<boolean>;
  getStatsByUserId(userId: number): Promise<{
    total: number;
    expired: number;
    expiringSoon: number;
    valid: number;
  }>;
}
