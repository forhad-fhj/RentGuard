import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterInitDto } from './dto/register-init.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';
import { UploadedSelfieFile } from '../../common/types/uploaded-file.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register-init')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start registration (step 1 of 2)',
    description:
      'Creates a pending account. Account is activated only after POST /auth/register-selfie with a live selfie.',
  })
  async registerInit(@Body() dto: RegisterInitDto) {
    return this.authService.registerInit(dto);
  }

  @Public()
  @Post('register-selfie')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('selfie', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['registrationToken', 'selfie'],
      properties: {
        registrationToken: { type: 'string' },
        selfie: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({
    summary: 'Complete registration with selfie (step 2 of 2)',
    description:
      'Uploads selfie, creates tenant/landlord profile, activates account, and returns JWT tokens.',
  })
  async registerSelfie(
    @Body('registrationToken') registrationToken: string,
    @UploadedFile() selfie: UploadedSelfieFile,
  ) {
    if (!registrationToken) {
      throw new BadRequestException('registrationToken is required');
    }
    return this.authService.registerSelfie(registrationToken, selfie);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start registration (alias for register-init)',
    deprecated: true,
  })
  async register(@Body() dto: RegisterInitDto) {
    return this.authService.registerInit(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
