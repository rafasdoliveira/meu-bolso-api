import { Controller, Get } from '@nestjs/common';
import { ExpenseCategoriesService } from './expense-categories.service';

@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly service: ExpenseCategoriesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
