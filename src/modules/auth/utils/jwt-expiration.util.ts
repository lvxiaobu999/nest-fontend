// 将环境变量中的 JWT_EXPIRES_IN 统一解析为秒数，供 JWT 和 Redis 会话共同使用。
export function parseJwtExpiresInToSeconds(expiresIn: string): number {
  const normalized = expiresIn.trim();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  const match = normalized.match(/^(\d+)\s*([smhd])$/i);

  if (!match) {
    throw new Error(`JWT_EXPIRES_IN 格式不正确: ${expiresIn}`);
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  const unitMap: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  return value * unitMap[unit];
}
