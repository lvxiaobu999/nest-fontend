import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

export function resolveNodeEnv() {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

export function loadEnv() {
  const nodeEnv = resolveNodeEnv();
  const envFiles = [`.env.${nodeEnv}`, '.env'];

  for (const envFile of envFiles) {
    const envPath = path.resolve(process.cwd(), envFile);

    if (!fs.existsSync(envPath)) {
      continue;
    }

    dotenv.config({
      path: envPath,
      override: false,
      quiet: true,
    });
  }

  return nodeEnv;
}
