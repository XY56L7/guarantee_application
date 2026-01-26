import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGuaranteeCheckDto {
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  purchaseDate: string;

  @IsString()
  @IsNotEmpty()
  expiryDate: string;

  @IsString()
  @IsNotEmpty()
  imagePath: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateGuaranteeCheckDto {
  @IsString()
  @IsOptional()
  storeName?: string;

  @IsString()
  @IsOptional()
  productName?: string;

  @IsString()
  @IsOptional()
  purchaseDate?: string;

  @IsString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  imagePath?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class GuaranteeCheckResponseDto {
  id: number;
  userId: number;
  storeName: string;
  productName: string;
  purchaseDate: string;
  expiryDate: string;
  imagePath: string;
  notes: string | null;
  createdAt: Date;
}

export class GuaranteeCheckStatsDto {
  total: number;
  expired: number;
  expiringSoon: number;
  valid: number;
}
