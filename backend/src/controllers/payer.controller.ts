import type { Prisma } from "@prisma/client";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  type CreatePayerBody,
  createPayerSchema,
  type GetPayersQuery,
  getPayersQuerySchema,
  type PayerIdParam,
  payerIdParamSchema,
  type UpdatePayerBody,
  updatePayerSchema,
} from "../schemas/payer.schema.js";

export const createPayer = async (
  request: FastifyRequest<{ Body: CreatePayerBody }>,
  reply: FastifyReply
) => {
  try {
    const validatedData = createPayerSchema.parse(request.body);

    const existing = await prisma.payer.findUnique({
      where: { walletAddress: validatedData.walletAddress },
      select: { id: true },
    });

    if (existing) {
      return reply.code(409).send({
        statusCode: 409,
        error: "Conflict",
        message: "Wallet address already exists",
      });
    }

    const payer = await prisma.payer.create({
      data: {
        walletAddress: validatedData.walletAddress,
        name: validatedData.name,
        email: validatedData.email ?? null,
      },
    });

    return reply.code(201).send(payer);
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

export const getPayers = async (
  request: FastifyRequest<{ Querystring: GetPayersQuery }>,
  reply: FastifyReply
) => {
  try {
    const validatedQuery = getPayersQuerySchema.parse(request.query);

    const where: Prisma.PayerWhereInput = {};

    if (validatedQuery.search) {
      where.OR = [
        {
          name: {
            contains: validatedQuery.search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: validatedQuery.search,
            mode: "insensitive",
          },
        },
        {
          walletAddress: {
            contains: validatedQuery.search,
            mode: "insensitive",
          },
        },
      ];
    }

    const skip = (validatedQuery.page - 1) * validatedQuery.limit;
    const take = validatedQuery.limit;

    const [payers, total] = await Promise.all([
      prisma.payer.findMany({
        where,
        skip,
        take,
        include: { subscriptions: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payer.count({ where }),
    ]);

    return reply.code(200).send({
      data: payers,
      meta: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages: Math.ceil(total / validatedQuery.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid query parameters",
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

export const getPayer = async (
  request: FastifyRequest<{ Params: PayerIdParam }>,
  reply: FastifyReply
) => {
  try {
    const validatedParams = payerIdParamSchema.parse(request.params);

    const payer = await prisma.payer.findUnique({
      where: { id: validatedParams.id },
      include: { subscriptions: true },
    });

    if (!payer) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payer not found",
      });
    }

    return reply.code(200).send(payer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid payer ID",
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

export const updatePayer = async (
  request: FastifyRequest<{ Params: PayerIdParam; Body: UpdatePayerBody }>,
  reply: FastifyReply
) => {
  try {
    const validatedParams = payerIdParamSchema.parse(request.params);
    const validatedData = updatePayerSchema.parse(request.body);

    const existingPayer = await prisma.payer.findUnique({
      where: { id: validatedParams.id },
    });

    if (!existingPayer) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payer not found",
      });
    }

    const payer = await prisma.payer.update({
      where: { id: validatedParams.id },
      data: {
        ...(validatedData.walletAddress && {
          walletAddress: validatedData.walletAddress,
        }),
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email !== undefined && {
          email: validatedData.email,
        }),
      },
    });

    return reply.code(200).send(payer);
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

export const deletePayer = async (
  request: FastifyRequest<{ Params: PayerIdParam }>,
  reply: FastifyReply
) => {
  try {
    const validatedParams = payerIdParamSchema.parse(request.params);

    const existingPayer = await prisma.payer.findUnique({
      where: { id: validatedParams.id },
    });

    if (!existingPayer) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payer not found",
      });
    }

    await prisma.payer.delete({
      where: { id: validatedParams.id },
    });

    return reply.code(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid payer ID",
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
