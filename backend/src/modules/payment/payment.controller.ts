import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get('lease/:leaseId')
  @ApiOperation({ summary: 'Get all payments for a lease' })
  async findAll(@Param('leaseId') leaseId: string) {
    return this.paymentService.findAll(leaseId);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process payment' })
  async processPayment(
    @Param('id') paymentId: string,
    @Body() body: { transactionId: string },
  ) {
    return this.paymentService.processPayment(paymentId, body.transactionId);
  }
}
