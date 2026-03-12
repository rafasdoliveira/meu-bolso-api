import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ExpenseStatus } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsInt({ message: 'O campo Usuário é obrigatório e deve ser um número' })
  user_id: number;

  @IsDateString(
    {},
    {
      message:
        'O campo Data é obrigatório e deve ser uma data válida (YYYY-MM-DD)',
    },
  )
  date: string;

  @IsString({ message: 'O campo Gasto é obrigatório' })
  description: string;

  @IsNumber({}, { message: 'O campo Valor é obrigatório e deve ser um número' })
  amount: number;

  @IsOptional()
  @IsInt({ message: 'Parcela atual deve ser um número inteiro' })
  @Min(1)
  installment_current?: number;

  @IsOptional()
  @IsInt({ message: 'Total de parcelas deve ser um número inteiro' })
  @Min(1)
  installment_total?: number;

  @IsOptional()
  @IsString({ message: 'O campo Item deve ser texto' })
  item?: string;

  @IsOptional()
  @IsString({ message: 'O campo Observação deve ser texto' })
  notes?: string;

  @IsOptional()
  @IsInt({ message: 'O campo Subcategoria deve ser um número' })
  subcategory_id?: number;

  @IsInt({ message: 'O campo Tipo de Pagamento é obrigatório' })
  payment_type_id: number;

  @IsEnum(ExpenseStatus, {
    message: 'Status deve ser "pending" ou "paid"',
  })
  status: ExpenseStatus;

  @IsOptional()
  @IsBoolean({ message: 'O campo Recorrente deve ser verdadeiro ou falso' })
  is_recurrent?: boolean;

  @IsOptional()
  @IsDateString({}, { message: 'Data final da recorrência deve ser uma data válida (YYYY-MM-DD)' })
  recurrence_end_date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data da fatura deve ser uma data válida (YYYY-MM-DD)' })
  invoice_date?: string;
}
