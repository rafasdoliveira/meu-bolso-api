import { InvoiceStatus } from '../entities/invoice.entity';

export class InvoiceResponseDto {
  id: number;
  payment_method: {
    id: number;
    name: string;
    due_day?: number;
  };
  reference_date: string;
  due_date?: string;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  status: InvoiceStatus;
}
