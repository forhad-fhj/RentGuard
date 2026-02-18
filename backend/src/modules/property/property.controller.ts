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
  @ApiOperation({ summary: 'Create a new property listing' })
  async create(
    @CurrentUser() user: any,
    @Body() createPropertyDto: CreatePropertyDto,
  ) {
    // Get landlord profile
    const landlordProfile = await this.prisma.landlordProfile.findUnique({
      where: { userId: user.id },
    });

    if (!landlordProfile) {
      throw new NotFoundException('Landlord profile not found');
    }

    return this.propertyService.create(landlordProfile.id, createPropertyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all available properties' })
  async findAll(@Query() filters: any) {
    return this.propertyService.findAll(filters);
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
    @CurrentUser() user: any,
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
  @ApiOperation({ summary: 'Delete property' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
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
    @CurrentUser() user: any,
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
