import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'testing', 'production']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:80'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_USER: z.string().default('moneto_admin'),
  DB_PASSWORD: z.string().default('MonetoSecurePassword2026!'),
  DB_NAME: z.string().default('moneto_dev'),
  DATABASE_URL: z.string().default('postgresql://moneto_admin:MonetoSecurePassword2026!@localhost:5432/moneto_dev?schema=public'),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32).default('super_secret_moneto_jwt_access_key_change_in_production_2026'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32).default('super_secret_moneto_jwt_refresh_key_change_in_production_2026'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
