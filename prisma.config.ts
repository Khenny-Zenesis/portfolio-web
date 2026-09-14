import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 removed `url`/`directUrl` from the schema.prisma datasource block
// — connection info for the Migrate/CLI now lives here instead. Migrate needs
// Supabase's DIRECT_URL (non-pooled, session-mode) connection, not the
// pooled DATABASE_URL the runtime client uses (that one is wired separately,
// via a driver adapter, in src/lib/db.ts). See AGENTS.md Section 2:
// "DATABASE_URL (pooled) and DIRECT_URL (migrations)".
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
