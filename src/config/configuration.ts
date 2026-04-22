import { getAppEnvironment, toNumber } from './env.util';

export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'nest-fontend',
    nodeEnv: getAppEnvironment(),
    port: Number(process.env.PORT ?? 3000),
  },
  database: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? '',
    name: process.env.POSTGRES_DB ?? '',
    url: process.env.DATABASE_URL ?? '',
  },
  logging: {
    level: process.env.LOG_LEVEL || (getAppEnvironment() === 'production' ? 'warn' : 'debug'),
    slowRequestThreshold: toNumber(process.env.SLOW_REQUEST_THRESHOLD, 1000),
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '2h',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? '',
    db: toNumber(process.env.REDIS_DB, 0),
  },
});
