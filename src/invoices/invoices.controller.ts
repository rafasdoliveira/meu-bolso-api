import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateInvoicePaymentDto } from './dto/update-invoice-payment.dto';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: number },
    @Query('payment_method_id') paymentMethodId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.invoicesService.findAll(
      user.id,
      paymentMethodId ? Number(paymentMethodId) : undefined,
      month ? Number(month) : undefined,
      year ? Number(year) : undefined,
    );
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.invoicesService.findOne(id, user.id);
  }

  @Patch(':id/payment')
  updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInvoicePaymentDto,
  ) {
    return this.invoicesService.updatePayment(id, dto);
  }
}
