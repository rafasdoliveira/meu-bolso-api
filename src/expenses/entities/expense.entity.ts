import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExpenseSubcategory } from '../../expense-categories/entities/expense-subcategory.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';

export enum ExpenseStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

@Entity({ name: 'expenses' })
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  installment_current?: number;

  @Column({ nullable: true })
  installment_total?: number;

  @Column({ nullable: true })
  item?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => PaymentMethod, { nullable: false })
  @JoinColumn({ name: 'payment_type_id' })
  paymentType: PaymentMethod;

  @ManyToOne(() => ExpenseSubcategory, { nullable: true })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory?: ExpenseSubcategory;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  status: ExpenseStatus;

  @Column({ default: false })
  is_recurrent: boolean;

  @Column({ type: 'date', nullable: true })
  recurrence_end_date?: Date;

  @Column({ type: 'uuid', nullable: true })
  recurrence_group_id?: string;

  @Column({ type: 'date', nullable: true })
  invoice_date?: Date;
}
