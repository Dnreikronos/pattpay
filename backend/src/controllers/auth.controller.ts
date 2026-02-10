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
        ...(validatedData.description && {
          description: validatedData.description,
        }),
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

    request.log.info({ receiver: receiver?.id }, 'Found receiver');

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

    const sanitizedUser = sanitizeUser(receiver);
    request.log.info({ sanitizedUser, hasToken: !!token }, 'Before sending response');

    const response = {
      user: sanitizedUser,
      token,
    };

    request.log.info({ responseKeys: Object.keys(response), userKeys: sanitizedUser ? Object.keys(sanitizedUser) : [] }, 'Response structure');

    return reply.code(200).send(response);
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
    request.log.info({ user: request.user }, '/me - Request user from JWT');

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

    request.log.info({
      foundReceiver: !!receiver,
      receiverId: receiver?.id,
      receiverEmail: receiver?.email
    }, '/me - Receiver lookup result');

    if (!receiver) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "User not found",
      });
    }

    const sanitized = sanitizeUser(receiver);
    request.log.info({
      sanitizedKeys: Object.keys(sanitized),
      sanitizedUser: sanitized
    }, '/me - Sanitized user data');

    const response = {
      user: sanitized,
    };

    request.log.info({
      responseKeys: Object.keys(response),
      hasUser: !!response.user,
      userKeys: response.user ? Object.keys(response.user) : []
    }, '/me - Final response structure');

    return reply.code(200).send(response);
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
};
