import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto } from '../dto/auth.dto';
import { Request } from 'express';

interface JwtUser {
  userId: string;
  email: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          console.log('🔍 JWT Extraction Debug:');
          console.log('Cookies:', request?.cookies);
          console.log(
            'Access token from cookies:',
            request?.cookies?.access_token,
          );

          const token = request?.cookies?.access_token;
          if (token) {
            console.log('✅ JWT token found in cookies');
          } else {
            console.log('❌ No JWT token found in cookies');
          }

          return token;
        },
      ]),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayloadDto): JwtUser {
    console.log('🔐 JWT Strategy validate called');
    console.log('Payload:', payload);

    const user = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    console.log('✅ JWT validation successful for user:', user.userId);
    return user;
  }
}
