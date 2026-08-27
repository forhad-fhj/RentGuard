import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { RegisterInitDto } from './dto/register-init.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';
import { UploadedSelfieFile } from '../../common/types/uploaded-file.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private s3Service: S3Service,
  ) {}

  /**
   * Step 1: create pending account (inactive until selfie is uploaded).
   */
  async registerInit(dto: RegisterInitDto) {
    const { email, phone, password, role } = dto;

    if (role !== UserRole.TENANT && role !== UserRole.LANDLORD) {
      throw new BadRequestException('Registration role must be TENANT or LANDLORD');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser?.isActive) {
      throw new ConflictException('User with this email or phone already exists');
    }

    if (existingUser && !existingUser.isActive) {
      const registrationToken = this.signRegistrationToken(existingUser.id);
      return {
        registrationToken,
        userId: existingUser.id,
        message: 'Registration pending — upload selfie to activate account',
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role,
        isActive: false,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    const registrationToken = this.signRegistrationToken(user.id);

    return {
      registrationToken,
      userId: user.id,
      message: 'Account created — upload selfie to complete registration',
    };
  }

  /**
   * Step 2: upload selfie, create role profile, activate account, issue JWT.
   */
  async registerSelfie(registrationToken: string, file: UploadedSelfieFile) {
    if (!file) {
      throw new BadRequestException('Selfie image is required to create an account');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, or WebP images are allowed');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Selfie must be 5MB or smaller');
    }

    const payload = this.verifyRegistrationToken(registrationToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        tenantProfile: true,
        landlordProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid registration token');
    }

    if (user.isActive && (user.tenantProfile || user.landlordProfile)) {
      throw new BadRequestException('Account is already active');
    }

    const selfieUrl = await this.s3Service.uploadSelfie(file.buffer, user.id);
    const fullName = user.email.split('@')[0] || 'RentGuard User';

    if (user.role === UserRole.TENANT) {
      await this.prisma.tenantProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          fullName,
          selfieUrl,
          profileVerificationStatus: 'SELFIE_ONLY',
        },
        update: {
          selfieUrl,
          profileVerificationStatus: 'SELFIE_ONLY',
        },
      });

      const tenantProfile = await this.prisma.tenantProfile.findUnique({
        where: { userId: user.id },
      });

      if (tenantProfile) {
        await this.prisma.creditScore.upsert({
          where: { tenantId: tenantProfile.id },
          create: {
            tenantId: tenantProfile.id,
            score: 600,
          },
          update: {},
        });
      }
    } else if (user.role === UserRole.LANDLORD) {
      await this.prisma.landlordProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          fullName,
          selfieUrl,
          profileVerificationStatus: 'SELFIE_ONLY',
        },
        update: {
          selfieUrl,
          profileVerificationStatus: 'SELFIE_ONLY',
        },
      });
    }

    const activated = await this.prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        subscriptionTier: true,
      },
    });

    await this.prisma.reviewFlag.create({
      data: {
        targetUserId: user.id,
        reason: 'SELFIE_QUALITY',
      },
    });

    const tokens = await this.generateTokens(activated.id, activated.email, activated.role);

    return {
      user: activated,
      ...tokens,
    };
  }

  /** @deprecated Use registerInit + registerSelfie */
  async register(dto: RegisterInitDto) {
    return this.registerInit(dto);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tenantProfile: true,
        landlordProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Registration incomplete — upload your selfie to activate your account',
      );
    }

    if (user.isSuspended) {
      throw new UnauthorizedException('Account is suspended');
    }

    const hasProfile = user.tenantProfile || user.landlordProfile;
    if (!hasProfile) {
      throw new UnauthorizedException(
        'Profile incomplete — re-register and upload a selfie',
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials (please use Google login)');
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, accessToken: string) {
    await this.prisma.session.deleteMany({
      where: { userId, accessToken },
    });
    return { message: 'Logged out successfully' };
  }

  private signRegistrationToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'registration' },
      { expiresIn: '30m' },
    );
  }

  private verifyRegistrationToken(token: string): { sub: string; type: string } {
    try {
      const payload = this.jwtService.verify(token) as { sub: string; type?: string };
      if (payload.type !== 'registration') {
        throw new UnauthorizedException('Invalid registration token');
      }
      return payload as { sub: string; type: string };
    } catch {
      throw new UnauthorizedException('Registration token expired or invalid');
    }
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiration'),
    });
    return { accessToken, refreshToken };
  }

  private async createSession(userId: string, accessToken: string, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.session.create({
      data: { userId, accessToken, refreshToken, expiresAt },
    });
  }

  async validateGoogleUser(googleUser: any) {
    const { provider, providerId, email, firstName, lastName } = googleUser;
    
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user since they don't exist
      user = await this.prisma.user.create({
        data: {
          email,
          provider: 'GOOGLE',
          providerId,
          isActive: true, // Google verified emails can be considered active
          isEmailVerified: true,
          role: 'TENANT', // Default role
          tenantProfile: {
            create: {
              fullName: `${firstName} ${lastName}`.trim() || 'Google User',
            }
          }
        },
      });
    } else if (!user.providerId) {
      // Link existing local account with Google
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'GOOGLE',
          providerId,
          isEmailVerified: true,
        },
      });
    }

    return user;
  }

  async googleLogin(user: any) {
    if (!user) {
      throw new UnauthorizedException('No user from google');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, role: user.role },
      tokens,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isSuspended: true,
        subscriptionTier: true,
      },
    });

    if (!user || !user.isActive || user.isSuspended) {
      return null;
    }
    return user;
  }
}
