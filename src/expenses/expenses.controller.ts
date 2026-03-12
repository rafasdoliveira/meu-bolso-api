import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UpdateExpenseStatusDto } from './dto/update-expense-status.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(@Query() query: ExpenseQueryDto) {
    const { page, size, year, month, search, payment_method_id, invoice_month, invoice_year } = query;
    return this.expensesService.findAllPaginated(page, size, year, month, search, payment_method_id, invoice_month, invoice_year);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.createExpense(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
    @Query('update_all') updateAll: string,
  ) {
    return this.expensesService.updateExpense(id, dto, updateAll === 'true');
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseStatusDto,
  ) {
    return this.expensesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('delete_all') deleteAll: string,
  ) {
    return this.expensesService.deleteExpense(id, deleteAll === 'true');
  }
}
