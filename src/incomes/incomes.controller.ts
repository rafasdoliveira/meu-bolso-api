import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IncomeService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { Income } from './income.entity';

@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  findAll(@Query('page') page = 1, @Query('size') size = 10) {
    const pageNumber = Number(page);
    const pageSize = Number(size);
    return this.incomeService.findAllPaginated(pageNumber, pageSize);
  }

  @Post()
  async create(@Body() dto: CreateIncomeDto): Promise<Income> {
    return this.incomeService.createIncome(dto);
  }
}
