import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategory } from '../expense-categories/entities/expense-category.entity';
import { ExpenseSubcategory } from '../expense-categories/entities/expense-subcategory.entity';
import { PaymentTypes } from '../payment-types/payment_types.entity';
import { Expense } from './entities/expense.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      PaymentTypes,
      ExpenseCategory,
      ExpenseSubcategory,
    ]),
  ],
  providers: [ExpensesService],
  controllers: [ExpensesController],
})
export class ExpensesModule {}
