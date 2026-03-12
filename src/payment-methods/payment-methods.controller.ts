import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { PaymentMethodResponseDto } from './dto/payment-method-response.dto';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  findAll(@Query('user_id', ParseIntPipe) user_id: number): Promise<PaymentMethodResponseDto[]> {
    return this.paymentMethodsService.findAll(user_id);
  }

  @Post()
  create(@Body() dto: CreatePaymentMethodDto): Promise<PaymentMethodResponseDto> {
    return this.paymentMethodsService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePaymentMethodDto>,
  ): Promise<PaymentMethodResponseDto> {
    return this.paymentMethodsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentMethodsService.remove(id);
  }
}
