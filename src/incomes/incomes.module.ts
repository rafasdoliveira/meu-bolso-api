import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/pagination/pagination.module';
import { PaymentTypes } from '../payment-types/payment_types.entity';
import { IncomeStatus } from './entities/income-status.entity';
import { Income } from './entities/income.entity';
import { IncomeSources } from '../sources/entities/sources.entity';
import { IncomeController } from './incomes.controller';
import { IncomeService } from './incomes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Income,
      PaymentTypes,
      IncomeStatus,
      IncomeSources,
    ]),
    PaginationModule,
  ],
  providers: [IncomeService],
  controllers: [IncomeController],
})
export class IncomesModule {}
