import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeQueryDto } from './dto/income-query.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { UpdateIncomeStatusDto } from './dto/update-income-status.dto';
import { IncomeService } from './incomes.service';

@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  findAll(@Query() query: IncomeQueryDto) {
    const { page, size, year, month } = query;
    return this.incomeService.findAllPaginated(page, size, year, month);
  }

  @Post()
  create(@Body() dto: CreateIncomeDto) {
    return this.incomeService.createIncome(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncomeDto,
  ) {
    return this.incomeService.updateIncome(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncomeStatusDto,
  ) {
    return this.incomeService.updateStatus(id, dto.status_id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.incomeService.deleteIncome(id);
  }
}
