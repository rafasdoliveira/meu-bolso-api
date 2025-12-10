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
    return this.paginationService.paginate(this.incomeRepository, page, size);
  }

  async createIncome(dto: CreateIncomeDto): Promise<Income> {
    const income = this.incomeRepository.create(dto);
    return this.incomeRepository.save(income);
  }
}
