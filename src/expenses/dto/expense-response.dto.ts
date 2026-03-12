export class ExpenseResponseDto {
  id: number;
  date: string;
  description: string;
  amount: string;
  installment?: string;
  item?: string;
  notes?: string;
  subcategory?: string;
  paymentType: string;
  status: string;
  is_recurrent: boolean;
  recurrence_group_id?: string;
  invoice_date?: string;
}
