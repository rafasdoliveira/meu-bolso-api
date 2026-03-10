import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExpenseCategory } from './expense-category.entity';

@Entity({ name: 'expense_subcategories' })
export class ExpenseSubcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => ExpenseCategory, (cat) => cat.subcategories, {
    nullable: false,
  })
  @JoinColumn({ name: 'category_id' })
  category: ExpenseCategory;
}
