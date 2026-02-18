import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaseService } from './lease.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('leases')
@Controller('leases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LeaseController {
  constructor(private readonly leaseService: LeaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lease' })
  async create(@Body() createLeaseDto: CreateLeaseDto) {
    return this.leaseService.create(createLeaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leases for current user' })
  async findAll(@CurrentUser() user: any) {
    return this.leaseService.findAll(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lease by ID' })
  async findOne(@Param('id') id: string) {
    return this.leaseService.findOne(id);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Sign lease' })
  async signLease(
    @Param('id') leaseId: string,
    @CurrentUser() user: any,
    @Body() body: { signature: string },
  ) {
    return this.leaseService.signLease(leaseId, user.id, body.signature);
  }
}
