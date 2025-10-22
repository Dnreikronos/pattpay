import { AuthMethod } from "@prisma/client";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  type SigninBody,
  type SignupBody,
  signinSchema,
  signupSchema,
} from "../schemas/auth.schema.js";
import {
  comparePassword,
  hashPassword,
  sanitizeUser,
} from "../utils/auth.utils.js";

export const signupController = async (
  request: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply
) => {
  try {
    const validatedData = signupSchema.parse(request.body);

    const existingEmail = await prisma.receiver.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return reply.code(409).send({
        statusCode: 409,
        error: "Conflict",
        message: "Email already exists",
      });
    }

    const passwordHash = await hashPassword(validatedData.password);

    const receiver = await prisma.receiver.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
        description: validatedData.description,
        authMethod: AuthMethod.EMAIL_PASSWORD,
        walletAddress: validatedData.walletAddress,
        tokenAccountUSDT: validatedData.tokenAccountUSDT,
        tokenAccountUSDC: validatedData.tokenAccountUSDC,
      },
    });

    const token = request.server.jwt.sign({
      userId: receiver.id,
      email: receiver.email,
      authMethod: receiver.authMethod,
    });

    return reply.code(201).send({
      user: sanitizeUser(receiver),
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Validation failed",
        details: error.issues,
      });
    }

    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
};

export const signinController = async (
  request: FastifyRequest<{ Body: SigninBody }>,
  reply: FastifyReply
) => {
  try {
    const validatedData = signinSchema.parse(request.body);

    const receiver = await prisma.receiver.findFirst({
      where: {
        email: validatedData.email,
        authMethod: AuthMethod.EMAIL_PASSWORD,
      },
    });

    if (!receiver || !receiver.passwordHash) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await comparePassword(
      validatedData.password,
      receiver.passwordHash
    );

    if (!isPasswordValid) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid credentials",
      });
    }

    const token = request.server.jwt.sign({
      userId: receiver.id,
      email: receiver.email,
      authMethod: receiver.authMethod,
    });

    return reply.code(200).send({
      user: sanitizeUser(receiver),
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Validation failed",
        details: error.issues,
      });
    }

    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
};

export const getMeController = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    if (!request.user) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const receiver = await prisma.receiver.findUnique({
      where: { id: request.user.userId },
    });

    if (!receiver) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "User not found",
      });
    }

    return reply.code(200).send({
      user: sanitizeUser(receiver),
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
};
