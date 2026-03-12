import { IsInt } from 'class-validator';

export class UpdateIncomeStatusDto {
  @IsInt({ message: 'Status deve ser um número inteiro' })
  status_id: number;
}
