import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  CreateGuaranteeCheckDto,
  UpdateGuaranteeCheckDto,
  GuaranteeCheckResponseDto,
  GuaranteeCheckStatsDto,
} from '../../application/dto/guarantee-check.dto';
import { CreateGuaranteeCheckUseCase } from '../../application/use-cases/guarantee-check/create-guarantee-check.use-case';
import { GetGuaranteeChecksUseCase } from '../../application/use-cases/guarantee-check/get-guarantee-checks.use-case';
import { GetGuaranteeCheckByIdUseCase } from '../../application/use-cases/guarantee-check/get-guarantee-check-by-id.use-case';
import { UpdateGuaranteeCheckUseCase } from '../../application/use-cases/guarantee-check/update-guarantee-check.use-case';
import { DeleteGuaranteeCheckUseCase } from '../../application/use-cases/guarantee-check/delete-guarantee-check.use-case';
import { GetGuaranteeCheckStatsUseCase } from '../../application/use-cases/guarantee-check/get-guarantee-check-stats.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';

@Controller('api/guarantee-checks')
@UseGuards(JwtAuthGuard)
export class GuaranteeChecksController {
  constructor(
    private readonly createUseCase: CreateGuaranteeCheckUseCase,
    private readonly getAllUseCase: GetGuaranteeChecksUseCase,
    private readonly getByIdUseCase: GetGuaranteeCheckByIdUseCase,
    private readonly updateUseCase: UpdateGuaranteeCheckUseCase,
    private readonly deleteUseCase: DeleteGuaranteeCheckUseCase,
    private readonly getStatsUseCase: GetGuaranteeCheckStatsUseCase,
  ) {}

  @Get()
  async getAll(@Request() req): Promise<{
    success: boolean;
    count: number;
    checks: GuaranteeCheckResponseDto[];
  }> {
    const checks = await this.getAllUseCase.execute(req.user.userId);
    return {
      success: true,
      count: checks.length,
      checks,
    };
  }

  @Get('stats/summary')
  async getStats(@Request() req): Promise<{
    success: boolean;
    stats: GuaranteeCheckStatsDto;
  }> {
    const stats = await this.getStatsUseCase.execute(req.user.userId);
    return {
      success: true,
      stats,
    };
  }

  @Get(':id')
  async getById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; check: GuaranteeCheckResponseDto }> {
    const check = await this.getByIdUseCase.execute(req.user.userId, id);
    return {
      success: true,
      check,
    };
  }

  @Post()
  async create(
    @Request() req,
    @Body() dto: CreateGuaranteeCheckDto,
  ): Promise<{
    success: boolean;
    message: string;
    check: GuaranteeCheckResponseDto;
  }> {
    const check = await this.createUseCase.execute(req.user.userId, dto);
    return {
      success: true,
      message: 'Guarantee check created successfully',
      check,
    };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGuaranteeCheckDto,
  ): Promise<{
    success: boolean;
    message: string;
    check: GuaranteeCheckResponseDto;
  }> {
    const check = await this.updateUseCase.execute(req.user.userId, id, dto);
    return {
      success: true,
      message: 'Guarantee check updated successfully',
      check,
    };
  }

  @Delete(':id')
  async delete(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.deleteUseCase.execute(req.user.userId, id);
    return {
      success: true,
      message: 'Guarantee check deleted successfully',
    };
  }
}
