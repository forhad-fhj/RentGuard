import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('properties')
@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new property listing (saved as DRAFT)' })
  async create(
    @CurrentUser() user: { id: string },
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    const landlordProfile = await this.prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      throw new NotFoundException('Landlord profile not found');
    }

    return this.propertyService.create(landlordProfile.id, createPropertyDto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List current landlord properties (all statuses)' })
  async findMine(@CurrentUser() user: { id: string }) {
    const landlordProfile = await this.prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      throw new NotFoundException('Landlord profile not found');
    }

    return this.propertyService.findByLandlord(landlordProfile.id);
  }

  @Get()
  @ApiOperation({ summary: 'Browse active property listings (public, paginated)' })
  async findAll(@Query() filters: Record<string, string>) {
    return this.propertyService.findAll(filters);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List applicants for a property (landlord only)' })
  async getApplications(
    @Param('id') propertyId: string,
    @CurrentUser() user: { id: string },
  ) {
    const landlordProfile = await this.prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      throw new NotFoundException('Landlord profile not found');
    }

    return this.propertyService.getApplications(propertyId, landlordProfile.id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publish a draft listing (requires photo + required fields)' })
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const landlordProfile = await this.prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      throw new NotFoundException('Landlord profile not found');
    }

    return this.propertyService.publish(id, landlordProfile.id);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Archive a property listing' })
  async archive(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    const landlordProfile = await this.prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      throw new NotFoundException('Landlord profile not found');
    }

    return this.propertyService.archive(id, landlordProfile.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  async findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update property' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    const landlordProfile = await this.prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      throw new NotFoundException('Landlord profile not found');
    }

    return this.propertyService.update(id, landlordProfile.id, updatePropertyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LANDLORD)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Archive property (soft delete)' })
  async remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    const landlordProfile = await this.prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      throw new NotFoundException('Landlord profile not found');
    }

    return this.propertyService.remove(id, landlordProfile.id);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Apply for a property' })
  async applyForProperty(
    @Param('id') propertyId: string,
    @CurrentUser() user: { id: string },
    @Body() body: { message?: string },
  ) {
    const tenantProfile = await this.prisma.tenantProfile.findUnique({
      where: { userId: user.id },
    });

    if (!tenantProfile) {
      throw new NotFoundException('Tenant profile not found');
    }

    return this.propertyService.applyForProperty(
      propertyId,
      tenantProfile.id,
      body.message,
    );
  }
}
