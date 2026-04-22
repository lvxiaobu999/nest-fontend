import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';
import { SafeUser } from '../users/users.service';
import { parseJwtExpiresInToSeconds } from './utils/jwt-expiration.util';

interface RedisSessionRecord {
  userId: string;
  username: string;
  token: string;
}

export interface CreatedSession {
  accessToken: string;
  expiresIn: number;
  sessionId: string;
}

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // 登录成功后创建 JWT 会话，并把当前 token 写入 Redis 方便后续校验和注销。
  async createSession(user: SafeUser): Promise<CreatedSession> {
    const sessionId = randomUUID();
    const expiresInConfig = this.configService.get<string>('jwt.expiresIn') ?? '2h';
    const expiresIn = parseJwtExpiresInToSeconds(expiresInConfig);
    const accessToken = await this.jwtService.signAsync(
      {
        username: user.username,
        roleId: user.roleId,
        isSuperAdmin: user.isSuperAdmin,
        nickname: user.nickname,
      },
      {
        subject: user.id,
        jwtid: sessionId,
        expiresIn,
      },
    );

    await this.redis.setex(
      this.getSessionKey(sessionId),
      expiresIn,
      JSON.stringify({
        userId: user.id,
        username: user.username,
        token: accessToken,
      } satisfies RedisSessionRecord),
    );

    return {
      accessToken,
      expiresIn,
      sessionId,
    };
  }

  // 每次鉴权时都校验 Redis 中是否仍然保留该会话，从而支持服务端主动注销 JWT。
  async validateSession(sessionId: string, accessToken: string): Promise<boolean> {
    const sessionValue = await this.redis.get(this.getSessionKey(sessionId));

    if (!sessionValue) {
      return false;
    }

    try {
      const session = JSON.parse(sessionValue) as RedisSessionRecord;
      return session.token === accessToken;
    } catch {
      return false;
    }
  }

  // 退出登录时删除当前会话对应的 Redis 记录，使 token 立即失效。
  async removeSession(sessionId: string): Promise<void> {
    await this.redis.del(this.getSessionKey(sessionId));
  }

  private getSessionKey(sessionId: string): string {
    return `auth:session:${sessionId}`;
  }
}
