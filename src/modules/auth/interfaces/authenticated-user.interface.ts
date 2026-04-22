// JWT 载荷中存放的是当前登录用户的基础身份信息和会话标识。
export interface JwtPayload {
  sub: string;
  username: string;
  roleId: string | null;
  isSuperAdmin: number;
  nickname: string;
  jti: string;
  iat?: number;
  exp?: number;
}

// 经过 JwtStrategy 校验后的请求用户对象，供受保护接口直接读取。
export interface AuthenticatedUser {
  userId: string;
  username: string;
  roleId: string | null;
  isSuperAdmin: number;
  nickname: string;
  sessionId: string;
}
