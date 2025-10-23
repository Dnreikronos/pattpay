import { type FastifyInstance } from "fastify";
import {
  getMeController,
  signinController,
  signupController,
} from "../controllers/auth.controller.js";

export async function authRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post("/signup", signupController);
  fastify.post("/signin", signinController);

  // Protected route
  fastify.get(
    "/me",
    {
      onRequest: [fastify.authenticate],
    },
    getMeController
  );
}
