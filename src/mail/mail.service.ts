import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendMagicLink(email: string, token: string): Promise<void> {
    const magicLink = `http://localhost:4200/auth/verify?token=${token}`;

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
