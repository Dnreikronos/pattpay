import { PrismaClient } from "@prisma/client";

const prismaSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaSingleton>;
}

export const prisma = globalThis.prisma ?? prismaSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
