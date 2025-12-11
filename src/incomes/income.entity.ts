import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'incomes' })
export class Income {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  source_id: number;

  @Column('decimal')
  amount: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'int' })
  payment_type_id: number;

  @Column({ type: 'int' })
  status_id: number;
}
