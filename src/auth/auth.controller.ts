import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthResponse, AuthService, AuthTokens } from './auth.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SuccessResponseDto } from '../common/dto/success-response.dto';

type RequestWithUser = Request & {
  user: {
    sub: string;
    phone: string;
  };
};

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: AuthUserDto })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse['user']> {
    const response = await this.authService.register(dto);
    this.setAuthCookies(res, response.tokens);

    return response.user;
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход пользователя' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthUserDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse['user']> {
    const response = await this.authService.login(dto);
    this.setAuthCookies(res, response.tokens);

    return response.user;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токенов авторизации' })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const refreshToken = this.extractRefreshToken(req, dto);
    const tokens = await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, tokens);

    return { success: true };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход пользователя' })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  async logout(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> {
    const refreshToken = this.extractRefreshToken(req, dto);
    const result = await this.authService.logout(refreshToken);
    this.clearAuthCookies(res);

    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiCookieAuth('accessToken')
  @ApiOkResponse({ type: AuthUserDto })
  getMe(
    @Req() req: RequestWithUser,
  ): Promise<{ id: string; phone: string; name: string }> {
    return this.authService.getMe(req.user.sub);
  }

  private setAuthCookies(res: Response, tokens: AuthTokens): void {
    const secure = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response): void {
    const secure = process.env.NODE_ENV === 'production';

    res.clearCookie('accessToken', { path: '/', sameSite: 'lax', secure });
    res.clearCookie('refreshToken', { path: '/', sameSite: 'lax', secure });
  }

  private extractRefreshToken(req: Request, dto?: RefreshDto): string {
    const refreshTokenFromCookie = req.cookies?.refreshToken;
    const refreshToken = refreshTokenFromCookie || dto?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh токен отсутствует');
    }

    return refreshToken;
  }
}
