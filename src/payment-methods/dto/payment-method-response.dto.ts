import { PaymentMethodType } from '../enums/payment-method-type.enum';

export class PaymentMethodResponseDto {
  id: number;
  name: string;
  type: PaymentMethodType;
  brand?: string;
  last_four_digits?: string;
  closing_day?: number;
  due_day?: number;
  is_protected: boolean;
}
