import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthSessionService } from '../auth-session.service';
import { AuthenticatedUser, JwtPayload } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authSessionService: AuthSessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') ?? '',
      passReqToCallback: true,
    });
  }

  // JWT 签名通过后，继续校验 Redis 中的会话是否存在，防止已注销 token 继续使用。
  async validate(req: Request, payload: JwtPayload): Promise<AuthenticatedUser> {
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!accessToken) {
      throw new UnauthorizedException('缺少访问令牌');
    }

    const isSessionValid = await this.authSessionService.validateSession(payload.jti, accessToken);

    if (!isSessionValid) {
      throw new UnauthorizedException('登录状态已失效，请重新登录');
    }

    return {
      userId: payload.sub,
      username: payload.username,
      roleId: payload.roleId,
      isSuperAdmin: payload.isSuperAdmin,
      nickname: payload.nickname,
      sessionId: payload.jti,
    };
  }
}
