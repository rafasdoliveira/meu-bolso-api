import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateIncomeDto {
  @IsOptional()
  @IsDateString({}, { message: 'Data deve ser uma data válida (YYYY-MM-DD)' })
  date?: string;

  @IsOptional()
  @IsInt({ message: 'Fonte de Renda deve ser um número inteiro' })
  source_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser um número' })
  amount?: number;

  @IsOptional()
  @IsString({ message: 'Observações deve ser texto' })
  notes?: string;

  @IsOptional()
  @IsInt({ message: 'Tipo de Pagamento deve ser um número inteiro' })
  payment_type_id?: number;

  @IsOptional()
  @IsInt({ message: 'Status deve ser um número inteiro' })
  status_id?: number;
}
