import { Module } from '@nestjs/common';
import { GuaranteeChecksController } from './guarantee-checks.controller';
import { CreateGuaranteeCheckUseCase } from '../application/use-cases/guarantee-check/create-guarantee-check.use-case';
import { GetGuaranteeChecksUseCase } from '../application/use-cases/guarantee-check/get-guarantee-checks.use-case';
import { GetGuaranteeCheckByIdUseCase } from '../application/use-cases/guarantee-check/get-guarantee-check-by-id.use-case';
import { UpdateGuaranteeCheckUseCase } from '../application/use-cases/guarantee-check/update-guarantee-check.use-case';
import { DeleteGuaranteeCheckUseCase } from '../application/use-cases/guarantee-check/delete-guarantee-check.use-case';
import { GetGuaranteeCheckStatsUseCase } from '../application/use-cases/guarantee-check/get-guarantee-check-stats.use-case';
import { GuaranteeCheckRepository } from '../infrastructure/repositories/guarantee-check.repository';
import { InMemoryDatabase } from '../persistence/database/in-memory.database';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GuaranteeChecksController],
  providers: [
    CreateGuaranteeCheckUseCase,
    GetGuaranteeChecksUseCase,
    GetGuaranteeCheckByIdUseCase,
    UpdateGuaranteeCheckUseCase,
    DeleteGuaranteeCheckUseCase,
    GetGuaranteeCheckStatsUseCase,
    GuaranteeCheckRepository,
    InMemoryDatabase,
    {
      provide: 'IGuaranteeCheckRepository',
      useClass: GuaranteeCheckRepository,
    },
  ],
})
export class GuaranteeChecksModule {}
