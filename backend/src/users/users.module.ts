import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { GetProfileUseCase } from '../application/use-cases/user/get-profile.use-case';
import { UpdateProfileUseCase } from '../application/use-cases/user/update-profile.use-case';
import { AuthDomainService } from '../domain/services/auth.domain.service';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { InMemoryDatabase } from '../persistence/database/in-memory.database';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    GetProfileUseCase,
    UpdateProfileUseCase,
    AuthDomainService,
    UserRepository,
    InMemoryDatabase,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
})
export class UsersModule {}
