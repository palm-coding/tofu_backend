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

  async validateUser(email: string, password: string): Promise<any> {
    console.log('🔐 Auth Validation Debug:');
    console.log('Email:', email);
    console.log('Password length:', password?.length);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    try {
      const user = await this.userService.findByEmail(email);
      console.log('👤 User found in DB:', !!user);

      if (user) {
        console.log('👤 Found user details:');
        console.log('  - ID:', user._id);
        console.log('  - Email:', user.email);
        console.log('  - Role:', user.role);
        console.log('  - Has password:', !!user.password);
        console.log(
          '  - Password hash preview:',
          user.password?.substring(0, 20) + '...',
        );

        // เพิ่ม debug สำหรับ password validation
        console.log('🔑 Starting password comparison...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('✅ Password validation result:', isPasswordValid);

        if (isPasswordValid) {
          const { ...result } = user.toObject();
          console.log('✅ Authentication successful for user:', result._id);
          return result;
        } else {
          console.log('❌ Password mismatch - Authentication failed');
          return null;
        }
      } else {
        console.log('❌ User not found with email:', email);
        return null;
      }
    } catch (error) {
      console.error('❌ Authentication error:', error.message);
      console.error('Error stack:', error.stack);
      return null;
    }
  }

  async login(user: JwtPayloadDto): Promise<LoginResponseDto> {
    console.log('🚀 Login process for user:', user._id);
    const payload = { email: user.email, sub: user._id };
    const token = await this.jwtService.signAsync(payload);
    console.log('🎟️ JWT token generated successfully');
    return { access_token: token };
  }
}
