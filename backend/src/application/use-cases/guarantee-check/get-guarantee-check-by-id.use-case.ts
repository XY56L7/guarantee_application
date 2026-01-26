import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { GuaranteeCheckResponseDto } from '../../dto/guarantee-check.dto';
import { IGuaranteeCheckRepository } from '../../../domain/repositories/guarantee-check.repository.interface';

@Injectable()
export class GetGuaranteeCheckByIdUseCase {
  constructor(
    @Inject('IGuaranteeCheckRepository')
    private readonly guaranteeCheckRepository: IGuaranteeCheckRepository,
  ) {}

  async execute(
    userId: number,
    id: number,
  ): Promise<GuaranteeCheckResponseDto> {
    const check = await this.guaranteeCheckRepository.findByUserIdAndId(
      userId,
      id,
    );
    if (!check) {
      throw new NotFoundException('Guarantee check not found');
    }
    return check.toJSON();
  }
}
