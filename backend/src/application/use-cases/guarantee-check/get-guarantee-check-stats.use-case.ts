import { Injectable, Inject } from '@nestjs/common';
import { GuaranteeCheckStatsDto } from '../../dto/guarantee-check.dto';
import { IGuaranteeCheckRepository } from '../../../domain/repositories/guarantee-check.repository.interface';

@Injectable()
export class GetGuaranteeCheckStatsUseCase {
  constructor(
    @Inject('IGuaranteeCheckRepository')
    private readonly guaranteeCheckRepository: IGuaranteeCheckRepository,
  ) {}

  async execute(userId: number): Promise<GuaranteeCheckStatsDto> {
    return await this.guaranteeCheckRepository.getStatsByUserId(userId);
  }
}
