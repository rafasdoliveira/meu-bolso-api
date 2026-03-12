import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { UpdateInvoicePaymentDto } from './dto/update-invoice-payment.dto';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(
    @Query('user_id', ParseIntPipe) userId: number,
    @Query('payment_method_id') paymentMethodId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.invoicesService.findAll(
      userId,
      paymentMethodId ? Number(paymentMethodId) : undefined,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('user_id', ParseIntPipe) userId: number,
  ) {
    return this.invoicesService.findOne(id, userId);
  }

  @Patch(':id/payment')
  updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInvoicePaymentDto,
  ) {
    return this.invoicesService.updatePayment(id, dto);
  }
}
