import { Body, Controller, Get, Post } from '@nestjs/common';
import { IncomeService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { Income } from './income.entity';

@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  findAll() {
    return this.incomeService.findAllPaginated();
  }

  @Post()
  async create(@Body() dto: CreateIncomeDto): Promise<Income> {
    return this.incomeService.createIncome(dto);
  }
}
