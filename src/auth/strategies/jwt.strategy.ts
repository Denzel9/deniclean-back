import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

type AccessJwtPayload = {
  sub: string;
  phone: string;
  type: 'access' | 'refresh';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request): string | null =>
          request.cookies?.accessToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  validate(payload: AccessJwtPayload): { sub: string; phone: string } {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Неверный тип токена');
    }

    return {
      sub: payload.sub,
      phone: payload.phone,
    };
  }
}
