type EnvRecord = Record<string, unknown>;

function getRequiredString(config: EnvRecord, key: string): string {
  const value = config[key];

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`环境变量 ${key} 未配置，请检查对应的环境文件。`);
  }

  return value;
}

function getRequiredPort(config: EnvRecord, key: string): number {
  const value = Number(getRequiredString(config, key));

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`环境变量 ${key} 必须是大于 0 的整数端口号。`);
  }

  return value;
}

function getOptionalNumber(config: EnvRecord, key: string, fallback: number): number {
  const rawValue = config[key];

  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`环境变量 ${key} 必须是大于等于 0 的整数。`);
  }

  return value;
}

export function validateEnv(config: EnvRecord) {
  const nodeEnv = typeof config.NODE_ENV === 'string' ? config.NODE_ENV : 'development';

  if (!['development', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV 只允许是 development 或 production。');
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: getRequiredPort(config, 'PORT'),
    POSTGRES_PORT: getRequiredPort(config, 'POSTGRES_PORT'),
    APP_NAME: getRequiredString(config, 'APP_NAME'),
    POSTGRES_HOST: getRequiredString(config, 'POSTGRES_HOST'),
    POSTGRES_USER: getRequiredString(config, 'POSTGRES_USER'),
    POSTGRES_PASSWORD: getRequiredString(config, 'POSTGRES_PASSWORD'),
    POSTGRES_DB: getRequiredString(config, 'POSTGRES_DB'),
    DATABASE_URL: getRequiredString(config, 'DATABASE_URL'),
    REDIS_HOST: getRequiredString(config, 'REDIS_HOST'),
    REDIS_PORT: getRequiredPort(config, 'REDIS_PORT'),
    REDIS_DB: getOptionalNumber(config, 'REDIS_DB', 0),
    JWT_SECRET: getRequiredString(config, 'JWT_SECRET'),
    JWT_EXPIRES_IN: getRequiredString(config, 'JWT_EXPIRES_IN'),
    LOG_LEVEL: getRequiredString(config, 'LOG_LEVEL'), // 日志级别
  };
}
