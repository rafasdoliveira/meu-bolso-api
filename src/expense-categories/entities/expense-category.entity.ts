import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ExpenseSubcategory } from './expense-subcategory.entity';

@Entity({ name: 'expense_categories' })
export class ExpenseCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => ExpenseSubcategory, (sub) => sub.category, { eager: true })
  subcategories: ExpenseSubcategory[];
}
