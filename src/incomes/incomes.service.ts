import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { formatDateToBR } from '../utils/formatDateToBR';
import { Between, Repository } from 'typeorm';
import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeResponseDto } from './dto/income-response.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Income } from './entities/income.entity';

const INCOME_RELATIONS = {
  paymentType: true,
  incomeStatus: true,
  incomeSources: true,
};

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
  ) {}

  async findAllPaginated(page = 1, size = 10, year?: number, month?: number) {
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth() + 1;

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0);

    const validPage = Math.max(page, 1);
    const validSize = Math.max(size, 1);

    const [data, total] = await this.incomeRepository.findAndCount({
      relations: INCOME_RELATIONS,
      where: { date: Between(startDate, endDate) },
      skip: (validPage - 1) * validSize,
      take: validSize,
    });

    const mappedData: IncomeResponseDto[] = data.map((income) => ({
      id: income.id,
      date: formatDateToBR(income.date),
      amount: income.amount.toString(),
      notes: income.notes,
      source: income.incomeSources.name,
      paymentType: income.paymentType.name,
      status: income.incomeStatus.name,
    }));

    return {
      page: validPage,
      size: validSize,
      total,
      totalPages: Math.ceil(total / validSize),
      data: mappedData,
    };
  }

  async createIncome(dto: CreateIncomeDto): Promise<Income> {
    const [year, month, day] = dto.date.split('-').map(Number);

    const income = this.incomeRepository.create({
      user_id: dto.user_id,
      date: new Date(year, month - 1, day),
      amount: dto.amount,
      notes: dto.notes,
      incomeSources: { id: dto.source_id },
      paymentType: { id: dto.payment_type_id },
      incomeStatus: { id: dto.status_id },
    });

    const saved = await this.incomeRepository.save(income);

    return this.incomeRepository.findOneOrFail({
      where: { id: saved.id },
      relations: INCOME_RELATIONS,
    });
  }

  async updateIncome(id: number, dto: UpdateIncomeDto): Promise<Income> {
    const income = await this.incomeRepository.findOne({
      where: { id },
      relations: INCOME_RELATIONS,
    });

    if (!income) throw new NotFoundException(`Receita #${id} não encontrada`);

    if (dto.date) {
      const [year, month, day] = dto.date.split('-').map(Number);
      income.date = new Date(year, month - 1, day);
    }
    if (dto.amount !== undefined) income.amount = dto.amount;
    if (dto.notes !== undefined) income.notes = dto.notes;
    if (dto.source_id !== undefined) income.incomeSources = { id: dto.source_id } as any;
    if (dto.payment_type_id !== undefined) income.paymentType = { id: dto.payment_type_id } as any;
    if (dto.status_id !== undefined) income.incomeStatus = { id: dto.status_id } as any;

    await this.incomeRepository.save(income);

    return this.incomeRepository.findOneOrFail({
      where: { id },
      relations: INCOME_RELATIONS,
    });
  }

  async updateStatus(id: number, status_id: number): Promise<{ id: number; status_id: number }> {
    const income = await this.incomeRepository.findOne({ where: { id } });

    if (!income) throw new NotFoundException(`Receita #${id} não encontrada`);

    income.incomeStatus = { id: status_id } as any;
    await this.incomeRepository.save(income);

    return { id, status_id };
  }

  async deleteIncome(id: number): Promise<{ deleted: number }> {
    const income = await this.incomeRepository.findOne({ where: { id } });

    if (!income) throw new NotFoundException(`Receita #${id} não encontrada`);

    await this.incomeRepository.delete(id);
    return { deleted: 1 };
  }
}
