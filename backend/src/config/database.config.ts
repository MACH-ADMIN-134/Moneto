import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { env } from './env.config.js';

// Legacy PG Pool connection for direct SQL execution
export const dbPool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

dbPool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Singleton Prisma Client instance
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
