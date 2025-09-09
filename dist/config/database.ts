import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../models/schema.js';
import * as relations from '../models/relations.js';

// Function to get connection string with debugging
function getConnectionString() {
  const dbUrl = process.env.DATABASE_URL;
  const fallback = 'postgresql://postgres.dmzeruxbkrkqcjsjxvta:LsbwQD4ZeT2wzUhL@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';
  
  console.log('🔧 Database Configuration Debug:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   DATABASE_URL exists: ${!!dbUrl}`);
  
  if (dbUrl) {
    // Mask password for logging
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`   DATABASE_URL: ${maskedUrl}`);
    return dbUrl;
  } else {
    console.log(`   Using fallback connection (DATABASE_URL not set)`);
    return fallback;
  }
}

// Create connection lazily
let sqlInstance: any = null;
let dbInstance: any = null;

function initializeDatabase() {
  if (!sqlInstance) {
    const connectionString = getConnectionString();
    sqlInstance = postgres(connectionString);
    dbInstance = drizzle(sqlInstance, { 
      schema: { 
        ...schema, 
        ...relations 
      } 
    });
  }
  return { sql: sqlInstance, db: dbInstance };
}

export function getDatabase() {
  const { db } = initializeDatabase();
  return db;
}

export function getSql() {
  const { sql } = initializeDatabase();
  return sql;
}

export async function testConnection() {
  try {
    console.log('🔗 Testing database connection...');
    const { sql } = initializeDatabase();
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Continuing in development mode without database...');
    }
  }
}

// Legacy exports for backward compatibility
export const sql = new Proxy({} as any, {
  get(target, prop) {
    return getSql()[prop];
  }
});

export const db = new Proxy({} as any, {
  get(target, prop) {
    return getDatabase()[prop];
  }
});