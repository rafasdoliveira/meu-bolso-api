import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income } from './income.entity';
import { IncomeService } from './incomes.service';
import { IncomeController } from './incomes.controller';
import { PaginationModule } from 'src/pagination/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([Income]), PaginationModule],
  providers: [IncomeService],
  controllers: [IncomeController],
})
export class IncomesModule {}
