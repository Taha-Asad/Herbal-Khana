import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, PoolConfig } from "pg";
import { PrismaClient } from "@prisma/client";

// Pool configuration
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection not established
  allowExitOnIdle: true, // Allow process to exit if pool is idle
};

// Create pool singleton
const globalForPg = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool = globalForPg.pool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForPg.pool = pool;
}

// Create adapter
const adapter = new PrismaPg(pool);

// Create Prisma client singleton
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

// Export pool for direct queries if needed
export { pool };
