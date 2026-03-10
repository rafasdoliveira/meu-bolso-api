import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategoriesController } from './expense-categories.controller';
import { ExpenseCategoriesService } from './expense-categories.service';
import { ExpenseCategory } from './entities/expense-category.entity';
import { ExpenseSubcategory } from './entities/expense-subcategory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpenseCategory, ExpenseSubcategory])],
  providers: [ExpenseCategoriesService],
  controllers: [ExpenseCategoriesController],
})
export class ExpenseCategoriesModule {}
