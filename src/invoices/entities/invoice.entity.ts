import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';

export enum InvoiceStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
}

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => PaymentMethod, { nullable: false })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod;

  @Column({ type: 'date' })
  reference_date: Date;

  @Column({ type: 'date', nullable: true })
  due_date?: Date;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paid_amount: number;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;
}
