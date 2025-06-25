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
    console.log('🔐 Login endpoint reached successfully');
    console.log('🔐 User data:', req.user);

    const { access_token } = await this.authService.login(req.user);

    // Production-ready cookie settings
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite:
        process.env.NODE_ENV === 'production'
          ? ('none' as const)
          : ('lax' as const), // Cross-site cookies for production
      maxAge: 6 * 60 * 60 * 1000, // 6 hours
      path: '/',
    };

    console.log('🍪 Setting cookie with options:', cookieOptions);

    res.cookie('access_token', access_token, cookieOptions);

    console.log('✅ Login successful, cookie set, returning response');

    return {
      message: 'Successfully logged in',
      userId: req.user._id || req.user.sub,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
      },
    };
  }

  // Logout
  @Get('logout')
  logout(@Res() res: Response) {
    console.log('🚪 Logout endpoint called');

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:
        process.env.NODE_ENV === 'production'
          ? ('none' as const)
          : ('lax' as const),
      path: '/',
    };

    res.clearCookie('access_token', cookieOptions);

    return res.json({
      message: 'Successfully logged out',
    });
  }
}
