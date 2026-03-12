import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentMethodType } from '../enums/payment-method-type.enum';

@Entity({ name: 'payment_methods' })
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: PaymentMethodType })
  type: PaymentMethodType;

  @Column({ type: 'varchar', nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  last_four_digits?: string;

  @Column({ type: 'int', nullable: true })
  closing_day?: number;

  @Column({ type: 'int', nullable: true })
  due_day?: number;

  @Column({ default: false })
  is_protected: boolean;
}
