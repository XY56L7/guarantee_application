import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IGuaranteeCheckRepository } from '../../../domain/repositories/guarantee-check.repository.interface';

@Injectable()
export class DeleteGuaranteeCheckUseCase {
  constructor(
    @Inject('IGuaranteeCheckRepository')
    private readonly guaranteeCheckRepository: IGuaranteeCheckRepository,
  ) {}

  async execute(userId: number, id: number): Promise<void> {
    const check = await this.guaranteeCheckRepository.findByUserIdAndId(
      userId,
      id,
    );
    if (!check) {
      throw new NotFoundException('Guarantee check not found');
    }

    const deleted = await this.guaranteeCheckRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Failed to delete guarantee check');
    }
  }
}
