import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  UpdateGuaranteeCheckDto,
  GuaranteeCheckResponseDto,
} from '../../dto/guarantee-check.dto';
import { IGuaranteeCheckRepository } from '../../../domain/repositories/guarantee-check.repository.interface';

@Injectable()
export class UpdateGuaranteeCheckUseCase {
  constructor(
    @Inject('IGuaranteeCheckRepository')
    private readonly guaranteeCheckRepository: IGuaranteeCheckRepository,
  ) {}

  async execute(
    userId: number,
    id: number,
    dto: UpdateGuaranteeCheckDto,
  ): Promise<GuaranteeCheckResponseDto> {
    const check = await this.guaranteeCheckRepository.findByUserIdAndId(
      userId,
      id,
    );
    if (!check) {
      throw new NotFoundException('Guarantee check not found');
    }

    const updates: any = {};
    if (dto.storeName) updates.storeName = dto.storeName;
    if (dto.productName) updates.productName = dto.productName;
    if (dto.purchaseDate) updates.purchaseDate = dto.purchaseDate;
    if (dto.expiryDate) updates.expiryDate = dto.expiryDate;
    if (dto.imagePath) updates.imagePath = dto.imagePath;
    if (dto.notes !== undefined) updates.notes = dto.notes;

    const updatedCheck = await this.guaranteeCheckRepository.update(id, updates);
    if (!updatedCheck) {
      throw new NotFoundException('Failed to update guarantee check');
    }

    return updatedCheck.toJSON();
  }
}
