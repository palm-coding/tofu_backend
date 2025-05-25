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
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: JwtPayloadDto): Promise<LoginResponseDto> {
    const payload = { email: user.email, sub: user._id };
    const token = await this.jwtService.signAsync(payload);
    return { access_token: token };
  }
}
