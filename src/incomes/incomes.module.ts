import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationModule } from 'src/pagination/pagination.module';
import { Income } from './income.entity';
import { IncomeController } from './incomes.controller';
import { IncomeService } from './incomes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Income]), PaginationModule],
  providers: [IncomeService],
  controllers: [IncomeController],
})
export class IncomesModule {}
