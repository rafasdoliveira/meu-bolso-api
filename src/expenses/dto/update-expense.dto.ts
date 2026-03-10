import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ExpenseStatus } from '../entities/expense.entity';

export class UpdateExpenseDto {
  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data válida (YYYY-MM-DD)' })
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  installment_current?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  installment_total?: number;

  @IsOptional()
  @IsString()
  item?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  subcategory_id?: number;

  @IsOptional()
  @IsInt()
  payment_type_id?: number;

  @IsOptional()
  @IsEnum(ExpenseStatus, { message: 'Status deve ser "pending" ou "paid"' })
  status?: ExpenseStatus;
}
