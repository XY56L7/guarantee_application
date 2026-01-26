import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GuaranteeChecksModule } from './guarantee-checks/guarantee-checks.module';
import { SeedService } from './persistence/seed/seed.service';
import { InMemoryDatabase } from './persistence/database/in-memory.database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    GuaranteeChecksModule,
  ],
  controllers: [AppController],
  providers: [SeedService, InMemoryDatabase],
})
export class AppModule {}
