import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import Fastify, { type FastifyInstance } from "fastify";
import { authRoutes } from "../../routes/auth.routes.js";
import { planRoutes } from "../../routes/plan.routes.js";

export async function buildTestApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false,
  });

  await fastify.register(fastifyCors);

  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
  });

  fastify.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ message: "Unauthorized" });
    }
  });

  // Register all routes
  await fastify.register(authRoutes, { prefix: "/api/auth" });
  await fastify.register(planRoutes, { prefix: "/api/links" });

  return fastify;
}
