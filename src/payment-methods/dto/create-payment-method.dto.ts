import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { PaymentMethodType } from '../enums/payment-method-type.enum';

export class CreatePaymentMethodDto {
  @IsString({ message: 'Informe o nome do meio de pagamento.' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  name: string;

  @IsEnum(PaymentMethodType, { message: 'Tipo inválido. Use: credit_card, debit_card, pix ou cash.' })
  type: PaymentMethodType;

  @IsOptional()
  @IsString({ message: 'Informe a bandeira do cartão.' })
  brand?: string;

  @IsOptional()
  @IsString({ message: 'Informe os últimos 4 dígitos do cartão.' })
  @Length(4, 4, { message: 'Os últimos dígitos devem ter exatamente 4 caracteres.' })
  last_four_digits?: string;

  @IsOptional()
  @IsInt({ message: 'O dia de fechamento deve ser um número inteiro.' })
  @Min(1)
  @Max(31)
  closing_day?: number;

  @IsOptional()
  @IsInt({ message: 'O dia de vencimento deve ser um número inteiro.' })
  @Min(1)
  @Max(31)
  due_day?: number;
}
