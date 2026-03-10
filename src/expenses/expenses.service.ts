import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { formatDateToBR } from '../utils/formatDateToBR';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';

const EXPENSE_RELATIONS = { paymentType: true, subcategory: true };

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async findAllPaginated(page = 1, size = 10, year?: number, month?: number) {
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth() + 1;

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);

    const validPage = Math.max(page, 1);
    const validSize = Math.max(size, 1);

    const [data, total] = await this.expenseRepository.findAndCount({
      relations: EXPENSE_RELATIONS,
      where: { date: Between(startDate, endDate) },
      skip: (validPage - 1) * validSize,
      take: validSize,
      order: { date: 'ASC' },
    });

    const mappedData: ExpenseResponseDto[] = data.map((expense) => ({
      id: expense.id,
      date: formatDateToBR(expense.date),
      description: expense.description,
      amount: Number(expense.amount).toFixed(2),
      installment:
        expense.installment_current && expense.installment_total
          ? `${expense.installment_current}/${expense.installment_total}`
          : undefined,
      item: expense.item,
      notes: expense.notes,
      paymentType: expense.paymentType.name,
      subcategory: expense.subcategory?.name,
      status: expense.status,
    }));

    return {
      page: validPage,
      size: validSize,
      total,
      totalPages: Math.ceil(total / validSize),
      data: mappedData,
    };
  }

  async createExpense(dto: CreateExpenseDto): Promise<Expense[]> {
    const [year, month, day] = dto.date.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);

    const hasInstallments = dto.installment_total && dto.installment_total > 1;

    const subcategory = dto.subcategory_id
      ? { id: dto.subcategory_id }
      : undefined;

    if (!hasInstallments) {
      const expense = this.expenseRepository.create({
        user_id: dto.user_id,
        date: baseDate,
        description: dto.description,
        amount: dto.amount,
        installment_current: dto.installment_current,
        installment_total: dto.installment_total,
        item: dto.item,
        notes: dto.notes,
        paymentType: { id: dto.payment_type_id },
        subcategory,
        status: dto.status,
      });

      const saved = await this.expenseRepository.save(expense);

      return this.expenseRepository.find({
        where: { id: saved.id },
        relations: EXPENSE_RELATIONS,
      });
    }

    const total = dto.installment_total!;
    const startInstallment = dto.installment_current ?? 1;

    const expenses: Expense[] = [];
    for (let i = 0; i < total; i++) {
      const installmentDate = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + i,
        baseDate.getDate(),
      );

      expenses.push(
        this.expenseRepository.create({
          user_id: dto.user_id,
          date: installmentDate,
          description: dto.description,
          amount: dto.amount,
          installment_current: startInstallment + i,
          installment_total: total,
          item: dto.item,
          notes: dto.notes,
          paymentType: { id: dto.payment_type_id },
          subcategory,
          status: dto.status,
        }),
      );
    }

    const saved = await this.expenseRepository.save(expenses);

    return this.expenseRepository.find({
      where: saved.map((e) => ({ id: e.id })),
      relations: EXPENSE_RELATIONS,
      order: { date: 'ASC' },
    });
  }

  async updateExpense(id: number, dto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: EXPENSE_RELATIONS,
    });

    if (!expense) {
      throw new NotFoundException(`Despesa #${id} não encontrada`);
    }

    if (dto.date) {
      const [year, month, day] = dto.date.split('-').map(Number);
      expense.date = new Date(year, month - 1, day);
    }
    if (dto.description !== undefined) expense.description = dto.description;
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.installment_current !== undefined)
      expense.installment_current = dto.installment_current;
    if (dto.installment_total !== undefined)
      expense.installment_total = dto.installment_total;
    if (dto.item !== undefined) expense.item = dto.item;
    if (dto.notes !== undefined) expense.notes = dto.notes;
    if (dto.status !== undefined) expense.status = dto.status;
    if (dto.payment_type_id !== undefined)
      expense.paymentType = { id: dto.payment_type_id } as any;
    if (dto.subcategory_id !== undefined)
      expense.subcategory = dto.subcategory_id
        ? ({ id: dto.subcategory_id } as any)
        : undefined;

    await this.expenseRepository.save(expense);

    return this.expenseRepository.findOneOrFail({
      where: { id },
      relations: EXPENSE_RELATIONS,
    });
  }

  async deleteExpense(
    id: number,
    deleteAll: boolean,
  ): Promise<{ deleted: number }> {
    const expense = await this.expenseRepository.findOne({ where: { id } });

    if (!expense) {
      throw new NotFoundException(`Despesa #${id} não encontrada`);
    }

    if (!expense.installment_total || !deleteAll) {
      await this.expenseRepository.delete(id);
      return { deleted: 1 };
    }

    // Busca todas as parcelas da mesma série (description + installment_total + user_id)
    const siblings = await this.expenseRepository.find({
      where: {
        user_id: expense.user_id,
        description: expense.description,
        installment_total: expense.installment_total,
      },
    });

    const ids = siblings.map((e) => e.id);
    await this.expenseRepository.delete(ids);

    return { deleted: ids.length };
  }
}
