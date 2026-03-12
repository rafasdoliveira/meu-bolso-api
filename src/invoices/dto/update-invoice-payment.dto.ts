import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

export class UpdateInvoicePaymentDto {
  @IsNumber()
  @Min(0)
  paid_amount: number;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;
}
