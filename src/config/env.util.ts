export type AppEnvironment = 'development' | 'production';

export function getAppEnvironment(): AppEnvironment {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

export function getEnvFilePaths(): string[] {
  const currentEnv = getAppEnvironment();

  return [`.env.${currentEnv}`, '.env'];
}
