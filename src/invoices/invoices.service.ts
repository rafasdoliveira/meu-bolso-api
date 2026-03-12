import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { formatDateToBR } from '../utils/formatDateToBR';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { UpdateInvoicePaymentDto } from './dto/update-invoice-payment.dto';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async findOrCreate(
    userId: number,
    paymentMethod: PaymentMethod,
    referenceDate: Date,
  ): Promise<Invoice> {
    const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);

    let invoice = await this.invoiceRepository.findOne({
      where: { user_id: userId, paymentMethod: { id: paymentMethod.id }, reference_date: ref },
    });

    if (!invoice) {
      const dueDate = paymentMethod.due_day
        ? new Date(ref.getFullYear(), ref.getMonth(), paymentMethod.due_day)
        : undefined;

      invoice = await this.invoiceRepository.save(
        this.invoiceRepository.create({
          user_id: userId,
          paymentMethod: { id: paymentMethod.id },
          reference_date: ref,
          due_date: dueDate,
          paid_amount: 0,
          status: InvoiceStatus.PENDING,
        }),
      );
    }

    return invoice;
  }

  async findAll(
    userId: number,
    paymentMethodId?: number,
    month?: number,
    year?: number,
  ): Promise<InvoiceResponseDto[]> {
    const where: any = { user_id: userId };

    if (paymentMethodId) where.paymentMethod = { id: paymentMethodId };

    if (month || year) {
      const now = new Date();
      const y = year ?? now.getFullYear();
      const m = month ?? now.getMonth() + 1;
      where.reference_date = Between(new Date(y, m - 1, 1), new Date(y, m, 0));
    }

    const invoices = await this.invoiceRepository.find({
      where,
      relations: { paymentMethod: true },
      order: { reference_date: 'DESC' },
    });

    return Promise.all(invoices.map((inv) => this.toResponse(inv, userId)));
  }

  async findOne(id: number, userId: number): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, user_id: userId },
      relations: { paymentMethod: true },
    });

    if (!invoice) throw new NotFoundException(`Fatura #${id} não encontrada`);

    return this.toResponse(invoice, userId);
  }

  async updatePayment(id: number, dto: UpdateInvoicePaymentDto): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: { paymentMethod: true },
    });

    if (!invoice) throw new NotFoundException(`Fatura #${id} não encontrada`);

    invoice.paid_amount = dto.paid_amount;

    if (dto.status) {
      invoice.status = dto.status;
    } else {
      const total = await this.computeTotal(invoice, invoice.user_id);
      invoice.status = this.resolveStatus(dto.paid_amount, total);
    }

    await this.invoiceRepository.save(invoice);

    return this.toResponse(invoice, invoice.user_id);
  }

  private async toResponse(invoice: Invoice, userId: number): Promise<InvoiceResponseDto> {
    const total = await this.computeTotal(invoice, userId);
    const paid = Number(invoice.paid_amount);

    return {
      id: invoice.id,
      payment_method: {
        id: invoice.paymentMethod.id,
        name: invoice.paymentMethod.name,
        due_day: invoice.paymentMethod.due_day,
      },
      reference_date: formatDateToBR(invoice.reference_date),
      due_date: invoice.due_date ? formatDateToBR(invoice.due_date) : undefined,
      total_amount: total.toFixed(2),
      paid_amount: paid.toFixed(2),
      remaining_amount: Math.max(total - paid, 0).toFixed(2),
      status: invoice.status,
    };
  }

  private async computeTotal(invoice: Invoice, userId: number): Promise<number> {
    const ref = new Date(invoice.reference_date);
    const year = ref.getUTCFullYear();
    const month = ref.getUTCMonth(); // 0-indexed

    const closingDay = invoice.paymentMethod.closing_day;

    let start: string;
    let end: string;

    if (closingDay) {
      // Billing cycle: (closing_day + 1) of previous month → closing_day of reference month
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonth = month === 0 ? 12 : month; // 1-indexed previous month
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
      const prevDay = Math.min(closingDay + 1, prevLastDay);
      start = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;

      const refMonth = month + 1; // 1-indexed
      const refLastDay = new Date(year, month + 1, 0).getDate();
      const endDay = Math.min(closingDay, refLastDay);
      end = `${year}-${String(refMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
    } else {
      // No closing day: use full calendar month
      const refMonth = month + 1;
      start = `${year}-${String(refMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      end = `${year}-${String(refMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }

    const [{ sum }] = await this.expenseRepository.query(
      `SELECT COALESCE(SUM(amount), 0) AS sum
       FROM expenses
       WHERE user_id = $1
         AND payment_type_id = $2
         AND invoice_date BETWEEN $3 AND $4`,
      [userId, invoice.paymentMethod.id, start, end],
    );

    return Number(sum);
  }

  private resolveStatus(paid: number, total: number): InvoiceStatus {
    if (paid <= 0) return InvoiceStatus.PENDING;
    if (paid >= total) return InvoiceStatus.PAID;
    return InvoiceStatus.PARTIAL;
  }
}
