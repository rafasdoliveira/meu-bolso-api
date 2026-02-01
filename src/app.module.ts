import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncomeStatus } from './incomes/entities/income-status.entity';
import { Income } from './incomes/entities/income.entity';
import { IncomesModule } from './incomes/incomes.module';
import { PaginationModule } from './pagination/pagination.module';
import { PaymentTypesModule } from './payment-types/payment-types.module';
import { PaymentTypes } from './payment-types/payment_types.entity';
import { IncomeSources } from './sources/entities/sources.entity';
import { SourcesModule } from './sources/sources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Income, PaymentTypes, IncomeStatus, IncomeSources],
      // synchronize: true,
    }),
    IncomesModule,
    SourcesModule,
    PaginationModule,
    PaymentTypesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
