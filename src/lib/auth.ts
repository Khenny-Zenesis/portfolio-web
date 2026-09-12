import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Admin authentication only (security.md: "Visitors never authenticate...
// authentication exists solely for the single admin user"). Open Question 2
// was resolved as "seed script": the one admin account's hashedPassword is
// set by prisma/seed.ts from ADMIN_EMAIL/ADMIN_PASSWORD in .env, never by
// this file or any agent.
const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials provider requires JWT sessions — Auth.js does not support
  // database-strategy sessions for Credentials-based sign-in.
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        // The Credentials provider gives no input validation of its own
        // (coding-standards.md: Zod validates all form/API input) —
        // validated here before ever touching the database.
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.hashedPassword) return null;

        const passwordMatches = await bcrypt.compare(
          parsed.data.password,
          user.hashedPassword
        );
        if (!passwordMatches) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
