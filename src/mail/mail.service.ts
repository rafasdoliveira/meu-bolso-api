import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.from = this.configService.get<string>('MAIL_FROM') ?? 'MeuBolso <noreply@meubolso.app>';
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Bem-vindo ao MeuBolso! 🎉',
      html: `
        <h2>Olá, ${name}!</h2>
        <p>Sua conta no <strong>MeuBolso</strong> foi criada com sucesso.</p>
        <p>Comece a controlar suas finanças agora mesmo.</p>
      `,
    });
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void> {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'Redefinição de senha — MeuBolso',
      html: `
        <h2>Olá, ${name}!</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
            Redefinir senha
          </a>
        </p>
        <p style="color:#888;font-size:12px;">Se você não solicitou isso, ignore este e-mail.</p>
      `,
    });
  }
}
