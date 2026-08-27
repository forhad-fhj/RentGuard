import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails } = profile;
    const user = {
      provider: 'GOOGLE',
      providerId: id,
      email: emails[0].value,
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
    };
    
    // We will validate/create the user in authService
    const validatedUser = await this.authService.validateGoogleUser(user);
    done(null, validatedUser);
  }
}
