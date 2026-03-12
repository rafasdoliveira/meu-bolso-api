import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategory } from '../expense-categories/entities/expense-category.entity';
import { ExpenseSubcategory } from '../expense-categories/entities/expense-subcategory.entity';
import { InvoicesModule } from '../invoices/invoices.module';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { Expense } from './entities/expense.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      PaymentMethod,
      ExpenseCategory,
      ExpenseSubcategory,
    ]),
    InvoicesModule,
  ],
  providers: [ExpensesService],
  controllers: [ExpensesController],
})
export class ExpensesModule {}
