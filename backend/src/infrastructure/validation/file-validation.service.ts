import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  private readonly ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

  validateImagePath(imagePath: string): void {
    if (!imagePath || typeof imagePath !== 'string') {
      throw new BadRequestException('Image path is required');
    }

    const extension = imagePath.toLowerCase().substring(imagePath.lastIndexOf('.'));
    if (!this.ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
      throw new BadRequestException(
        `Invalid image type. Allowed types: ${this.ALLOWED_IMAGE_EXTENSIONS.join(', ')}`,
      );
    }

    if (imagePath.length > 500) {
      throw new BadRequestException('Image path is too long');
    }

    if (/[<>:"|?*]/.test(imagePath)) {
      throw new BadRequestException('Image path contains invalid characters');
    }
  }

  validateFileSize(size: number): void {
    if (size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  validateMimeType(mimeType: string): void {
    if (!this.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }
  }
}
