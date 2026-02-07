import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import {
  CreateGuaranteeCheckDto,
  GuaranteeCheckResponseDto,
} from '../../dto/guarantee-check.dto';
import { IGuaranteeCheckRepository } from '../../../domain/repositories/guarantee-check.repository.interface';
import { FileValidationService } from '../../../infrastructure/validation/file-validation.service';

@Injectable()
export class CreateGuaranteeCheckUseCase {
  constructor(
    @Inject('IGuaranteeCheckRepository')
    private readonly guaranteeCheckRepository: IGuaranteeCheckRepository,
    private readonly fileValidationService: FileValidationService,
  ) {}

  async execute(
    userId: number,
    dto: CreateGuaranteeCheckDto,
  ): Promise<GuaranteeCheckResponseDto> {
    if (
      !dto.storeName ||
      !dto.productName ||
      !dto.purchaseDate ||
      !dto.expiryDate ||
      !dto.imagePath
    ) {
      throw new BadRequestException(
        'Store name, product name, purchase date, expiry date, and image path are required',
      );
    }

    this.fileValidationService.validateImagePath(dto.imagePath);

    const check = await this.guaranteeCheckRepository.create({
      userId,
      storeName: dto.storeName,
      productName: dto.productName,
      purchaseDate: dto.purchaseDate,
      expiryDate: dto.expiryDate,
      imagePath: dto.imagePath,
      notes: dto.notes || null,
    } as any);

    return check.toJSON();
  }
}
