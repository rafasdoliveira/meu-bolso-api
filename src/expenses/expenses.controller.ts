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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UpdateExpenseStatusDto } from './dto/update-expense-status.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(@CurrentUser() user: { id: number }, @Query() query: ExpenseQueryDto) {
    const { page, size, year, month, search, payment_method_id, invoice_month, invoice_year } = query;
    return this.expensesService.findAllPaginated(user.id, page, size, year, month, search, payment_method_id, invoice_month, invoice_year);
  }

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreateExpenseDto) {
    return this.expensesService.createExpense(user.id, dto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
    @Query('update_all') updateAll: string,
  ) {
    return this.expensesService.updateExpense(user.id, id, dto, updateAll === 'true');
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseStatusDto,
  ) {
    return this.expensesService.updateStatus(user.id, id, dto.status);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Query('delete_all') deleteAll: string,
  ) {
    return this.expensesService.deleteExpense(user.id, id, deleteAll === 'true');
  }
}
