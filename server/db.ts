import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Vercel Edge/Serverless için WebSocket devre dışı
if (process.env.VERCEL) {
  neonConfig.fetchConnectionCache = true;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Add it to your Vercel Environment Variables.",
  );
}

// Connection pool için timeout ayarları
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({ 
  connectionString,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle({ client: pool, schema });
