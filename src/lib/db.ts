import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 removed the built-in Rust query engine — the client now requires
// an explicit driver adapter instead of reading `datasource.url` from
// schema.prisma itself. This is where DATABASE_URL (the pooled connection)
// is actually used; prisma.config.ts's DIRECT_URL is Migrate's, separate
// concern. See AGENTS.md Section 2: "DATABASE_URL (pooled) and DIRECT_URL
// (migrations)".
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Standard Next.js + Prisma singleton pattern: prevents exhausting the
// database connection pool from hot-reload creating a new PrismaClient on
// every edit in development. Server-only — per database-schema.md, Prisma
// is never imported into a client component.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
