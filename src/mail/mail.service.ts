import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: NestMailerService,
    private configService: ConfigService,
  ) {}

  async sendMagicLink(email: string, token: string): Promise<void> {
    const magicLink = `${this.configService.get<string>('CLIENT_HOST')}/auth/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Your Magic Link for Authentication',
      html: `
      <html>
        <body>
          <h1>Welcome to Your App</h1>
          <p>Click below to authenticate:</p>
          <a href="${magicLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Authenticate</a>
        </body>
      </html>
    `,
    });
  }
}
