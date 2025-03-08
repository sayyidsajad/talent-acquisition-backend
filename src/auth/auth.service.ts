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

  async generateMagicLink(email: string, role: string) {
    let user;

    if (role === 'Candidate') {
      user = await this.prisma.candidate.findUnique({
        where: { email },
      });

      if (!user) {
        user = await this.prisma.candidate.create({
          data: { email },
        });
      }
    } else {
      user = await this.prisma.hr.findUnique({
        where: { email },
      });

      if (!user) {
        user = await this.prisma.hr.create({
          data: { email },
        });
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.prisma.magicLink.create({
      data: {
        token,
        email,
        role,
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

    const user = await this.prisma[magicLink.role.toLowerCase()].findUnique({
      where: { email: magicLink.email },
    });
    const jwtToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: magicLink.role,
    });
    return { jwtToken: jwtToken, role: magicLink.role };
  }
}
