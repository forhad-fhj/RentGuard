import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Injectable()
export class DisputeService {
  constructor(private prisma: PrismaService) {}

  async create(createDisputeDto: CreateDisputeDto) {
    return this.prisma.dispute.create({
      data: createDisputeDto,
    });
  }

  async findAll(leaseId?: string) {
    const where: any = {};
    if (leaseId) {
      where.leaseId = leaseId;
    }

    return this.prisma.dispute.findMany({
      where,
      include: {
        evidence: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        evidence: true,
        messages: true,
        lease: true,
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async addEvidence(disputeId: string, fileUrl: string, uploadedBy: string, fileType: string, description?: string) {
    return this.prisma.disputeEvidence.create({
      data: {
        disputeId,
        fileUrl,
        uploadedBy,
        fileType,
        description,
      },
    });
  }

  async addMessage(disputeId: string, senderId: string, message: string, isInternal = false) {
    return this.prisma.disputeMessage.create({
      data: {
        disputeId,
        senderId,
        message,
        isInternal,
      },
    });
  }
}
