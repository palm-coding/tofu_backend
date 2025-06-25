import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtPayloadDto, LoginResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('🔐 Auth Validation Debug:');
    console.log('Email:', email);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    const user = await this.userService.findByEmail(email);
    console.log('👤 User found in DB:', !!user);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: JwtPayloadDto): Promise<LoginResponseDto> {
    console.log('🚀 Login process for user:', user._id);
    const payload = { email: user.email, sub: user._id };
    const token = await this.jwtService.signAsync(payload);
    console.log('🎟️ JWT token generated successfully');
    return { access_token: token };
  }
}
