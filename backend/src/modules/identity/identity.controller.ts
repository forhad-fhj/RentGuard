import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { IdentityService } from './identity.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateIdentityVerificationDto } from './dto/create-identity-verification.dto';
import { UserRole } from '@prisma/client';

@ApiTags('identity')
@Controller('identity')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('verify')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit identity verification documents' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 3))
  async createVerification(
    @CurrentUser() user: any,
    @Body() dto: CreateIdentityVerificationDto,
  ) {
    return this.identityService.createVerification(user.id, dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get verification status' })
  async getVerificationStatus(@CurrentUser() user: any) {
    return this.identityService.getVerification(user.id);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all pending verifications (Admin only)' })
  async getPendingVerifications() {
    return this.identityService.getAllPendingVerifications();
  }
}
