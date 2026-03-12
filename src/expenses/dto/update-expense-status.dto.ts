import { IsEnum } from 'class-validator';
import { ExpenseStatus } from '../entities/expense.entity';

export class UpdateExpenseStatusDto {
  @IsEnum(ExpenseStatus, { message: 'Status inválido. Use: pending ou paid.' })
  status: ExpenseStatus;
}
