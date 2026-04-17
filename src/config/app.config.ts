import { getAppEnvironment } from './env.util';

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
});
