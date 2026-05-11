import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type JwtPayload = {
  sub: string;
  phone: string;
  type: 'access' | 'refresh';
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  user: {
    id: string;
    phone: string;
    name: string;
  };
  tokens: AuthTokens;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByPhone(dto.phone);
    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким телефоном уже существует',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(
      dto.phone,
      dto.name,
      passwordHash,
    );

    const tokens = await this.issueTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByPhone(dto.phone);

    if (!user) {
      throw new UnauthorizedException('Неверный телефон или пароль');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный телефон или пароль');
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Недействительный refresh токен');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Недействительный refresh токен');
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(refreshToken: string): Promise<{ success: true }> {
    const payload = await this.verifyRefreshToken(refreshToken);
    await this.usersService.setRefreshTokenHash(payload.sub, null);

    return { success: true };
  }

  async getMe(
    userId: string,
  ): Promise<{ id: string; phone: string; name: string }> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
    };
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      type: 'access',
    };
    const refreshPayload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.getRequiredEnv('JWT_ACCESS_SECRET'),
        expiresIn: this.getRequiredEnv('JWT_ACCESS_EXPIRES_IN') as StringValue,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.getRequiredEnv('JWT_REFRESH_SECRET'),
        expiresIn: this.getRequiredEnv('JWT_REFRESH_EXPIRES_IN') as StringValue,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshTokenHash(userId, refreshTokenHash);
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.getRequiredEnv('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Неверный тип refresh токена');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Недействительный refresh токен');
    }
  }

  private getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
  }
}
