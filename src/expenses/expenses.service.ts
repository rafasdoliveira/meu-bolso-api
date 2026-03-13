import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, MoreThanOrEqual, Repository } from 'typeorm';
import { formatDateToBR } from '../utils/formatDateToBR';
import { InvoicesService } from '../invoices/invoices.service';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense, ExpenseStatus } from './entities/expense.entity';

const EXPENSE_RELATIONS = { paymentType: true, subcategory: true };

function calcInvoiceDate(expenseDate: Date, closingDay: number, dueDay: number): Date {
  const cycleOffset = expenseDate.getDate() <= closingDay ? 0 : 1;
  const paymentOffset = dueDay < closingDay ? 1 : 0;
  return new Date(expenseDate.getFullYear(), expenseDate.getMonth() + cycleOffset + paymentOffset, 1);
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    private readonly invoicesService: InvoicesService,
  ) {}

  async findAllPaginated(
    userId: number,
    page = 1,
    size = 10,
    year?: number,
    month?: number,
    search?: string,
    payment_method_id?: number,
    invoice_month?: number,
    invoice_year?: number,
  ) {
    const now = new Date();
    const validPage = Math.max(page, 1);
    const validSize = Math.max(size, 1);

    const where: any = { user_id: userId };

    if (invoice_month) {
      const iy = invoice_year ?? now.getFullYear();
      const startInvoice = new Date(iy, invoice_month - 1, 1);
      const endInvoice = new Date(iy, invoice_month, 0);
      where.invoice_date = Between(startInvoice, endInvoice);
    } else {
      const y = year ?? now.getFullYear();
      const m = month ?? now.getMonth() + 1;
      where.date = Between(new Date(y, m - 1, 1), new Date(y, m, 0));
    }

    if (search) where.description = ILike(`%${search}%`);
    if (payment_method_id) where.paymentType = { id: payment_method_id };

    const [data, total] = await this.expenseRepository.findAndCount({
      relations: EXPENSE_RELATIONS,
      where,
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
      paymentType: expense.paymentType?.name ?? null,
      subcategory: expense.subcategory?.name,
      status: expense.status,
      is_recurrent: expense.is_recurrent,
      recurrence_group_id: expense.recurrence_group_id,
      invoice_date: expense.invoice_date ? formatDateToBR(expense.invoice_date) : undefined,
    }));

    return {
      page: validPage,
      size: validSize,
      total,
      totalPages: Math.ceil(total / validSize),
      data: mappedData,
    };
  }

  async createExpense(userId: number, dto: CreateExpenseDto): Promise<Expense[]> {
    const [year, month, day] = dto.date.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);

    const hasInstallments = dto.installment_total && dto.installment_total > 1;

    const subcategory = dto.subcategory_id
      ? { id: dto.subcategory_id }
      : undefined;

    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: dto.payment_type_id },
    });

    const resolveInvoiceDate = (expenseDate: Date): Date | undefined => {
      if (dto.invoice_date) return new Date(dto.invoice_date);
      if (paymentMethod?.closing_day) return calcInvoiceDate(expenseDate, paymentMethod.closing_day, paymentMethod.due_day ?? 0);
      return undefined;
    };

    if (dto.is_recurrent) {
      const groupId = randomUUID();
      const endDate = dto.recurrence_end_date
        ? new Date(dto.recurrence_end_date)
        : new Date(baseDate.getFullYear(), baseDate.getMonth() + 24, baseDate.getDate());

      const expenses: Expense[] = [];
      let i = 0;
      while (true) {
        const recurrentDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate());
        if (recurrentDate > endDate) break;
        expenses.push(
          this.expenseRepository.create({
            user_id: userId,
            date: recurrentDate,
            description: dto.description,
            amount: dto.amount,
            item: dto.item,
            notes: dto.notes,
            paymentType: { id: dto.payment_type_id },
            subcategory,
            status: dto.status,
            is_recurrent: true,
            recurrence_end_date: endDate,
            recurrence_group_id: groupId,
            invoice_date: resolveInvoiceDate(recurrentDate),
          }),
        );
        i++;
      }

      const saved = await this.expenseRepository.save(expenses);
      if (paymentMethod) await this.syncInvoices(userId, paymentMethod, saved);
      return this.expenseRepository.find({
        where: saved.map((e) => ({ id: e.id })),
        relations: EXPENSE_RELATIONS,
        order: { date: 'ASC' },
      });
    }

    if (!hasInstallments) {
      const expense = this.expenseRepository.create({
        user_id: userId,
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
        invoice_date: resolveInvoiceDate(baseDate),
      });

      const saved = await this.expenseRepository.save(expense);
      if (paymentMethod) await this.syncInvoices(userId, paymentMethod, [saved]);

      return this.expenseRepository.find({
        where: { id: saved.id },
        relations: EXPENSE_RELATIONS,
      });
    }

    const total = Number(dto.installment_total);
    const startInstallment = dto.installment_current ?? 1;
    const remainingInstallments = total - startInstallment + 1;

    const expenses: Expense[] = [];
    for (let i = 0; i < remainingInstallments; i++) {
      const installmentDate = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() + i,
        baseDate.getDate(),
      );

      expenses.push(
        this.expenseRepository.create({
          user_id: userId,
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
          invoice_date: resolveInvoiceDate(installmentDate),
        }),
      );
    }

    const saved = await this.expenseRepository.save(expenses);
    if (paymentMethod) await this.syncInvoices(userId, paymentMethod, saved);

    return this.expenseRepository.find({
      where: saved.map((e) => ({ id: e.id })),
      relations: EXPENSE_RELATIONS,
      order: { date: 'ASC' },
    });
  }

  private async syncInvoices(userId: number, paymentMethod: PaymentMethod, expenses: Expense[]): Promise<void> {
    const seen = new Set<string>();
    for (const expense of expenses) {
      if (!expense.invoice_date) continue;
      const key = `${expense.invoice_date.getFullYear()}-${expense.invoice_date.getMonth()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      await this.invoicesService.findOrCreate(userId, paymentMethod, expense.invoice_date);
    }
  }

  async updateExpense(userId: number, id: number, dto: UpdateExpenseDto, updateAll = false): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id, user_id: userId },
      relations: EXPENSE_RELATIONS,
    });

    if (!expense) {
      throw new NotFoundException(`Despesa #${id} não encontrada`);
    }

    if (updateAll && expense.installment_total) {
      const siblings = await this.expenseRepository.find({
        where: {
          user_id: userId,
          description: expense.description,
          installment_total: expense.installment_total,
        },
      });

      const updates: Partial<Expense> = {};
      if (dto.description !== undefined) updates.description = dto.description;
      if (dto.amount !== undefined) updates.amount = dto.amount;
      if (dto.item !== undefined) updates.item = dto.item;
      if (dto.notes !== undefined) updates.notes = dto.notes;
      if (dto.payment_type_id !== undefined) updates.paymentType = { id: dto.payment_type_id } as any;
      if (dto.subcategory_id !== undefined) updates.subcategory = dto.subcategory_id ? ({ id: dto.subcategory_id } as any) : undefined;

      await this.expenseRepository.save(siblings.map((s) => ({ ...s, ...updates })));
    } else {
      if (dto.date) {
        const [year, month, day] = dto.date.split('-').map(Number);
        expense.date = new Date(year, month - 1, day);
      }
      if (dto.description !== undefined) expense.description = dto.description;
      if (dto.amount !== undefined) expense.amount = dto.amount;
      if (dto.installment_current !== undefined) expense.installment_current = dto.installment_current;
      if (dto.installment_total !== undefined) expense.installment_total = dto.installment_total;
      if (dto.item !== undefined) expense.item = dto.item;
      if (dto.notes !== undefined) expense.notes = dto.notes;
      if (dto.status !== undefined) expense.status = dto.status;
      if (dto.payment_type_id !== undefined) expense.paymentType = { id: dto.payment_type_id } as any;
      if (dto.subcategory_id !== undefined)
        expense.subcategory = dto.subcategory_id ? ({ id: dto.subcategory_id } as any) : undefined;
      if (dto.invoice_date !== undefined)
        expense.invoice_date = dto.invoice_date ? new Date(dto.invoice_date) : undefined;

      await this.expenseRepository.save(expense);
    }

    return this.expenseRepository.findOneOrFail({
      where: { id, user_id: userId },
      relations: EXPENSE_RELATIONS,
    });
  }

  async updateStatus(userId: number, id: number, status: ExpenseStatus): Promise<{ id: number; status: ExpenseStatus }> {
    const expense = await this.expenseRepository.findOne({ where: { id, user_id: userId } });

    if (!expense) {
      throw new NotFoundException(`Despesa #${id} não encontrada`);
    }

    expense.status = status;
    await this.expenseRepository.save(expense);

    return { id, status };
  }

  async deleteExpense(userId: number, id: number, deleteAll: boolean): Promise<{ deleted: number }> {
    const expense = await this.expenseRepository.findOne({ where: { id, user_id: userId } });

    if (!expense) {
      throw new NotFoundException(`Despesa #${id} não encontrada`);
    }

    if (!deleteAll) {
      await this.expenseRepository.delete(id);
      return { deleted: 1 };
    }

    if (expense.is_recurrent && expense.recurrence_group_id) {
      const future = await this.expenseRepository.find({
        where: {
          recurrence_group_id: expense.recurrence_group_id,
          date: MoreThanOrEqual(expense.date),
        },
      });
      const ids = future.map((e) => e.id);
      await this.expenseRepository.delete(ids);
      return { deleted: ids.length };
    }

    if (expense.installment_total) {
      const siblings = await this.expenseRepository.find({
        where: {
          user_id: userId,
          description: expense.description,
          installment_total: expense.installment_total,
        },
      });
      const ids = siblings.map((e) => e.id);
      await this.expenseRepository.delete(ids);
      return { deleted: ids.length };
    }

    await this.expenseRepository.delete(id);
    return { deleted: 1 };
  }
}
