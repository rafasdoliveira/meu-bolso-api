import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from './dto/payment-method-response.dto';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: number }): Promise<PaymentMethodResponseDto[]> {
    return this.paymentMethodsService.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: number }, @Body() dto: CreatePaymentMethodDto): Promise<PaymentMethodResponseDto> {
    return this.paymentMethodsService.create(user.id, dto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePaymentMethodDto>,
  ): Promise<PaymentMethodResponseDto> {
    return this.paymentMethodsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: { id: number }, @Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentMethodsService.remove(user.id, id);
  }
}
