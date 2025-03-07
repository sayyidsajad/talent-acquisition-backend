import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailService,
    private jwtService: JwtService,
  ) {}

  async generateMagicLink(email: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
        },
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.magicLink.create({
      data: {
        token,
        email,
        expiresAt,
      },
    });

    await this.mailerService.sendMagicLink(email, token);
  }
  async verifyMagicLink(token: string) {
    const magicLink = await this.prisma.magicLink.findFirst({
      where: { token },
    });

    if (!magicLink) {
      throw new Error('Invalid or expired token');
    }

    if (magicLink.expiresAt < new Date()) {
      throw new Error('Token has expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: magicLink.email },
    });
    const jwtToken = this.jwtService.sign({ userId: user.id });

    return jwtToken;
  }
}
