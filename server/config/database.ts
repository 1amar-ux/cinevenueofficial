import { PrismaClient } from "@prisma/client";
import { logger } from "../shared/logger";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ||
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
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

// Reuse PrismaClient instance across warm serverless invocations to prevent connection leaks
globalThis.prismaGlobal = prisma;

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
