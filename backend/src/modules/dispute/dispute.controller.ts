import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a dispute' })
  async create(
    @Body() createDisputeDto: CreateDisputeDto,
    @CurrentUser() user: any,
  ) {
    return this.disputeService.create(createDisputeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all disputes' })
  async findAll(@Query('leaseId') leaseId?: string) {
    return this.disputeService.findAll(leaseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute by ID' })
  async findOne(@Param('id') id: string) {
    return this.disputeService.findOne(id);
  }

  @Post(':id/evidence')
  @ApiOperation({ summary: 'Add evidence to dispute' })
  async addEvidence(
    @Param('id') disputeId: string,
    @CurrentUser() user: any,
    @Body() body: { fileUrl: string; description?: string },
  ) {
    return this.disputeService.addEvidence(
      disputeId,
      body.fileUrl,
      user.id,
      body.description,
    );
  }

  @Post(':id/message')
  @ApiOperation({ summary: 'Add message to dispute' })
  async addMessage(
    @Param('id') disputeId: string,
    @CurrentUser() user: any,
    @Body() body: { message: string; isInternal?: boolean },
  ) {
    return this.disputeService.addMessage(
      disputeId,
      user.id,
      body.message,
      body.isInternal,
    );
  }
}
