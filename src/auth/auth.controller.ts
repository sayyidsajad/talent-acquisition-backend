import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; role: string }) {
    const { email, role } = body;
    await this.authService.generateMagicLink(email, role);
    return { message: 'Login link has been sent to your email.' };
  }

  @Public()
  @Get('verify')
  async verify(@Query('token') token: string) {
    const data = await this.authService.verifyMagicLink(token);
    return { message: 'Login successful', data };
  }
}
