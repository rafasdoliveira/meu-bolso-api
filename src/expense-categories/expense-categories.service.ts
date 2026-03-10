import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ExpenseCategory } from './entities/expense-category.entity';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepository: Repository<ExpenseCategory>,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      subcategories: cat.subcategories
        .map((sub) => ({ id: sub.id, name: sub.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }
}
