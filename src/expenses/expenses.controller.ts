import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(@Query() query: ExpenseQueryDto) {
    const { page, size, year, month } = query;
    return this.expensesService.findAllPaginated(page, size, year, month);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.createExpense(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.updateExpense(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('delete_all') deleteAll: string,
  ) {
    return this.expensesService.deleteExpense(id, deleteAll === 'true');
  }
}
