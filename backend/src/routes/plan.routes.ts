import { type FastifyInstance } from "fastify";
import { createPlanController } from "../controllers/plan.controller.js";
import type { CreatePlanBody } from "../schemas/plan.schema.js";

export async function planRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CreatePlanBody }>(
    "/",
    {
      onRequest: [fastify.authenticate],
    },
    createPlanController
  );
}
