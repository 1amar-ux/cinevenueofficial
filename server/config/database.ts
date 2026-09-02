import { PrismaClient } from "@prisma/client";
import { logger } from "../shared/logger";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" }
          ]
        : [{ emit: "stdout", level: "error" }]
  });

if (process.env.NODE_ENV === "development") {
  (prisma as any).$on?.("query", (e: any) => {
    logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
  });
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Perform a lightweight query to verify connectivity
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error: any) {
    logger.warn(`Database connection check returned an alert: ${error.message}`);
    return false;
  }
}
