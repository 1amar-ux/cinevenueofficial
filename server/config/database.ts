import { PrismaClient } from "@prisma/client";
import { logger } from "../shared/logger";
import { env } from "./env";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function initPrismaClient(): PrismaClient {
  if (globalThis.prismaGlobal) return globalThis.prismaGlobal;
  try {
    const client = new PrismaClient({
      datasourceUrl: env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/cinevenue",
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
      (client as any).$on?.("query", (e: any) => {
        logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
      });
    }

    globalThis.prismaGlobal = client;
    return client;
  } catch (err: any) {
    logger.warn(`Prisma client initialization fallback: ${err?.message || err}`);
    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === "$disconnect" || prop === "$connect") return async () => {};
        if (prop === "$queryRaw") return async () => { throw new Error("Database offline"); };
        return new Proxy({}, {
          get() {
            return async () => null;
          }
        });
      }
    });
  }
}

export const prisma = initPrismaClient();

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
