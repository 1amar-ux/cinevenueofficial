/**
 * CineVenue Unified Prisma Access Layer
 * Provides browser-safe abstraction so client bundles don't load node-specific database drivers
 */

// Fallback dummy proxy for browser environments
const createBrowserPrisma = () => {
  return new Proxy({}, {
    get: (_target, prop) => {
      if (prop === "$disconnect" || prop === "$connect") {
        return () => Promise.resolve();
      }
      return new Proxy({}, {
        get: () => () => Promise.resolve([])
      });
    }
  });
};

let prismaInstance: any;

if (typeof window === "undefined") {
  try {
    // Dynamic require/import on server only
    const { PrismaClient } = require("@prisma/client");
    prismaInstance = new PrismaClient();
  } catch {
    prismaInstance = createBrowserPrisma();
  }
} else {
  prismaInstance = createBrowserPrisma();
}

export const prisma = prismaInstance;
export default prisma;
