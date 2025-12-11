import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './income.entity';
import { PaginationService } from '../pagination/pagination.service';
import { CreateIncomeDto } from './dto/create-income.dto';

@Injectable()
export class IncomeService {
  findAll() {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAllPaginated(page = 1, size = 10) {
    const validPage = page > 0 ? page : 1;
    const validSize = size > 0 ? size : 10;

    const [data, total] = await this.incomeRepository.findAndCount({
      skip: (validPage - 1) * validSize,
      take: validSize,
    });

    return {
      page: validPage,
      size: validSize,
      total,
      totalPages: Math.ceil(total / validSize),
      data,
    };
  }

  async createIncome(dto: CreateIncomeDto): Promise<Income> {
    const income = this.incomeRepository.create(dto);
    return this.incomeRepository.save(income);
  }
}
