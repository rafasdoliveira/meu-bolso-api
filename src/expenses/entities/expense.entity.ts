import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExpenseSubcategory } from '../../expense-categories/entities/expense-subcategory.entity';
import { PaymentTypes } from '../../payment-types/payment_types.entity';

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

  @ManyToOne(() => PaymentTypes, { nullable: false })
  @JoinColumn({ name: 'payment_type_id' })
  paymentType: PaymentTypes;

  @ManyToOne(() => ExpenseSubcategory, { nullable: true })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory?: ExpenseSubcategory;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  status: ExpenseStatus;
}
