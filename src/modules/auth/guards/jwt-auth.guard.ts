import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JWT 守卫，交给 passport-jwt 完成签名校验和用户挂载。
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
