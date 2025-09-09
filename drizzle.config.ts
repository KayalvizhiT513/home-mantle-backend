import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/models/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres.dmzeruxbkrkqcjsjxvta:LsbwQD4ZeT2wzUhL@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
  },
  verbose: true,
  strict: true,
} satisfies Config;