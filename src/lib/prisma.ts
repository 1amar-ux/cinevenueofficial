/**
 * CineVenue Unified Prisma Access Layer
 * Re-exports the canonical Prisma singleton configured in server/config/database.ts
 */
import { prisma as canonicalPrisma } from "../../server/config/database";

export const prisma = canonicalPrisma;

export default prisma;
