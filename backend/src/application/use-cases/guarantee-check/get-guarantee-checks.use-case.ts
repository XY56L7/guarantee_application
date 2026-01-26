import { Injectable, Inject } from '@nestjs/common';
import { GuaranteeCheckResponseDto } from '../../dto/guarantee-check.dto';
import { IGuaranteeCheckRepository } from '../../../domain/repositories/guarantee-check.repository.interface';

@Injectable()
export class GetGuaranteeChecksUseCase {
  constructor(
    @Inject('IGuaranteeCheckRepository')
    private readonly guaranteeCheckRepository: IGuaranteeCheckRepository,
  ) {}

  async execute(userId: number): Promise<GuaranteeCheckResponseDto[]> {
    const checks = await this.guaranteeCheckRepository.findAllByUserId(userId);
    return checks.map((check) => check.toJSON());
  }
}
