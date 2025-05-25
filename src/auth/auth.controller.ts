import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { access_token } = await this.authService.login(req.user);
    res.cookie('access_token', access_token, {
      httpOnly: true,
    });

    return {
      message: 'Successfully logged in',
      userId: req.user.userId || req.user.sub,
    };
  }

  // Logout
  @Get('logout')
  logout(@Res() res: Response, @Request() req) {
    // ดึง userId จาก token ก่อนที่จะลบ cookie
    const token = req.cookies['access_token'];
    let userId = null;

    if (token) {
      try {
        // ถอดรหัส token โดยไม่ต้องตรวจสอบ signature เพราะเราเพียงแค่ต้องการ userId
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(
          Buffer.from(base64Payload, 'base64').toString(),
        );
        userId = payload.sub || payload.userId;
      } catch (e) {
        console.error('Error decoding token for logout:', e);
      }
    }

    res.clearCookie('access_token', {
      httpOnly: true,
    });

    return res.json({
      message: 'Successfully logged out',
      userId,
    });
  }
}
