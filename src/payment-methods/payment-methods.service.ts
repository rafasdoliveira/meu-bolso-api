import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from './dto/payment-method-response.dto';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async findAll(user_id: number): Promise<PaymentMethodResponseDto[]> {
    const methods = await this.paymentMethodRepository.find({
      where: { user_id: In([user_id, 0]) },
      order: { name: 'ASC' },
    });

    return methods.map((m) => this.toResponse(m));
  }

  async create(dto: CreatePaymentMethodDto): Promise<PaymentMethodResponseDto> {
    const method = this.paymentMethodRepository.create(dto);
    const saved = await this.paymentMethodRepository.save(method);
    return this.toResponse(saved);
  }

  async update(id: number, dto: Partial<CreatePaymentMethodDto>): Promise<PaymentMethodResponseDto> {
    const method = await this.paymentMethodRepository.findOne({ where: { id } });
    if (!method) throw new NotFoundException('Meio de pagamento não encontrado.');

    Object.assign(method, dto);
    const saved = await this.paymentMethodRepository.save(method);
    return this.toResponse(saved);
  }

  async remove(id: number): Promise<void> {
    const method = await this.paymentMethodRepository.findOne({ where: { id } });
    if (!method) throw new NotFoundException('Meio de pagamento não encontrado.');
    if (method.is_protected) throw new BadRequestException('Este meio de pagamento não pode ser excluído.');
    await this.paymentMethodRepository.remove(method);
  }

  private toResponse(method: PaymentMethod): PaymentMethodResponseDto {
    return {
      id: method.id,
      name: method.name,
      type: method.type,
      brand: method.brand,
      last_four_digits: method.last_four_digits,
      closing_day: method.closing_day,
      due_day: method.due_day,
      is_protected: method.is_protected,
    };
  }
}
