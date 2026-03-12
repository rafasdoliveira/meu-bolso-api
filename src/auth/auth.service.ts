import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { MoreThan, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from '../users/dto/register.dto';
import { PasswordResetToken } from '../users/entities/password-reset-token.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    await this.mailService.sendWelcome(user.email, user.name).catch(() => null);
    return { id: user.id, name: user.name, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('E-mail ou senha inválidos');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedException('E-mail ou senha inválidos');

    return this.generateTokens(user.id, user.email);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: number; email: string }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return; // silencioso — não revelar se e-mail existe

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.resetTokenRepository.save(
      this.resetTokenRepository.create({ user, token, expires_at: expiresAt }),
    );

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    await this.mailService.sendPasswordReset(user.email, user.name, resetUrl).catch(() => null);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await this.resetTokenRepository.findOne({
      where: { token, used_at: undefined, expires_at: MoreThan(new Date()) },
      relations: { user: true },
    });

    if (!record) throw new BadRequestException('Token inválido ou expirado');

    await this.usersService.updatePassword(record.user.id, newPassword);

    record.used_at = new Date();
    await this.resetTokenRepository.save(record);
  }

  generateTokens(userId: number, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, email },
      { secret: this.configService.get<string>('JWT_REFRESH_SECRET'), expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }
}
