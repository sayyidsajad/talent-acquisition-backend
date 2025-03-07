import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string }) {
    const { email } = body;
    await this.authService.generateMagicLink(email);
    return { message: 'Magic link sent to your email.' };
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    const jwtToken = await this.authService.verifyMagicLink(token);
    return { message: 'Login successful', jwtToken };
  }
}
