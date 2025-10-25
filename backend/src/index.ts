import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import Fastify from "fastify";
import { config } from "./config.js";
import { authRoutes } from "./routes/auth.routes.js";
import { planRoutes } from "./routes/plan.routes.js";

const fastify = Fastify({
  logger: {
    level: config.NODE_ENV === "development" ? "info" : "warn",
  },
});

const buildServer = async () => {
  await fastify.register(fastifyCors, {
    origin: config.FRONTEND_URL,
    credentials: true,
  });

  await fastify.register(fastifyJwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: "7d",
    },
  });

  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
    }
  });

  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(planRoutes, { prefix: "/api/links" });

  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    // Handle validation errors
    if (error.validation) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Validation failed",
        details: error.validation,
      });
    }

    // Handle JWT errors
    if (error.message.includes("jwt")) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid or expired token",
      });
    }

    // Generic error response
    reply.code(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || "Internal Server Error",
      message: error.message || "An unexpected error occurred",
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      statusCode: 404,
      error: "Not Found",
      message: `Route ${request.method}:${request.url} not found`,
    });
  });
};

// Start server with graceful shutdown
const start = async () => {
  try {
    await buildServer();
    const port = parseInt(config.PORT);
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`🚀 Server is running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received, closing server gracefully...`);
  await fastify.close();
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

start();
