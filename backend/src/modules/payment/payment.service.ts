import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const lease = await this.prisma.lease.findUnique({
      where: { id: createPaymentDto.leaseId },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    // Calculate due date (typically monthly)
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);

    return this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        amount: lease.monthlyRent,
        dueDate,
        status: PaymentStatus.PENDING,
      },
    });
  }

  async processPayment(paymentId: string, transactionId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId,
        paidAt: new Date(),
      },
    });

    // Create lease event
    await this.prisma.leaseEvent.create({
      data: {
        leaseId: payment.leaseId,
        eventType: 'PAYMENT_RECEIVED',
        description: `Payment of ${payment.amount} received`,
      },
    });

    return updated;
  }

  async findAll(leaseId: string) {
    return this.prisma.payment.findMany({
      where: { leaseId },
      orderBy: { dueDate: 'desc' },
    });
  }
}
