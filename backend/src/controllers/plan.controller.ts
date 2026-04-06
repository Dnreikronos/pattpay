import type { Prisma } from "@prisma/client";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import { config } from "../config.js";
import { getTokenConfig } from "../constants/tokens.js";
import { prisma } from "../db.js";
import {
  type CreatePlanBody,
  createPlanSchema,
  type GetLinksQuery,
  getLinksQuerySchema,
  type PlanIdParam,
  planIdParamSchema,
  type UpdatePlanBody,
  updatePlanSchema,
} from "../schemas/plan.schema.js";
import { transformPlanToCheckoutLink } from "../utils/plan.utils.js";

export const createPlanController = async (
  request: FastifyRequest<{ Body: CreatePlanBody }>,
  reply: FastifyReply
) => {
  try {
    const frontendUrl =
      config.FRONTEND_URL.split(",")[0] || "http://localhost:3000";
    const validatedData = createPlanSchema.parse(request.body);
    const userId = request.user.userId;

    const receiver = await prisma.receiver.findUnique({
      where: { id: userId },
    });

    if (!receiver) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Receiver not found",
      });
    }

    const enrichedTokenPrices = validatedData.tokenPrices.map((tokenPrice) => {
      const tokenConfig = getTokenConfig(tokenPrice.token);
      if (!tokenConfig) {
        throw new Error(`Token ${tokenPrice.token} not found in configuration`);
      }
      return {
        tokenMint: tokenConfig.mint,
        tokenDecimals: tokenConfig.decimals,
        price: tokenPrice.price,
        symbol: tokenConfig.symbol,
      };
    });

    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.plan.create({
        data: {
          receiverId: userId,
          name: validatedData.name,
          ...(validatedData.description && {
            description: validatedData.description,
          }),
          ...(validatedData.redirectUrl && {
            redirectUrl: validatedData.redirectUrl,
          }),
          ...(validatedData.expiresAt && {
            expiresAt: new Date(validatedData.expiresAt),
          }),
          isRecurring: validatedData.isRecurring,
          ...(validatedData.durationMonths && {
            durationMonths: validatedData.durationMonths,
          }),
          ...(validatedData.periodSeconds && {
            periodSeconds: validatedData.periodSeconds,
          }),
          status: "ACTIVE",
        },
      });

      await tx.planToken.createMany({
        data: enrichedTokenPrices.map((token) => ({
          planId: plan.id,
          symbol: token.symbol,
          tokenMint: token.tokenMint,
          tokenDecimals: token.tokenDecimals,
          price: token.price,
        })),
      });

      const createdTokens = await tx.planToken.findMany({
        where: { planId: plan.id },
      });

      return { plan, tokens: createdTokens };
    });

    const paymentUrl = `${frontendUrl}/payment/${result.plan.id}`;

    return reply.code(201).send({
      link: {
        id: result.plan.id,
        name: result.plan.name,
        description: result.plan.description,
        url: paymentUrl, // Generated payment link
        redirectUrl: result.plan.redirectUrl,
        expiresAt: result.plan.expiresAt?.toISOString(),
        isRecurring: result.plan.isRecurring,
        status: result.plan.status,
        durationMonths: result.plan.durationMonths,
        periodSeconds: result.plan.periodSeconds,
        createdAt: result.plan.createdAt.toISOString(),
        updatedAt: result.plan.updatedAt.toISOString(),
        receiver: {
          id: receiver.id,
          name: receiver.name,
          walletAddress: receiver.walletAddress,
        },
        tokenPrices: result.tokens.map((t) => ({
          id: t.id,
          token: t.symbol,
          tokenMint: t.tokenMint,
          tokenDecimals: t.tokenDecimals,
          price: t.price.toString(),
        })),
      },
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

export const getAllPlansController = async (
  request: FastifyRequest<{ Querystring: GetLinksQuery }>,
  reply: FastifyReply
) => {
  try {
    const validatedQuery = getLinksQuerySchema.parse(request.query);
    const userId = request.user.userId;

    const where: Prisma.PlanWhereInput = {
      receiverId: userId,
    };

    if (validatedQuery.status !== "all") {
      where.status = validatedQuery.status;
    }

    if (validatedQuery.isRecurring !== "all") {
      where.isRecurring = validatedQuery.isRecurring === "true" ? true : false;
    }

    if (validatedQuery.search) {
      where.name = {
        contains: validatedQuery.search,
        mode: "insensitive",
      };
    }

    const skip = (validatedQuery.page - 1) * validatedQuery.limit;
    const take = validatedQuery.limit;

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        include: {
          receiver: true,
          planTokens: true,
          _count: {
            select: {
              paymentExecutions: true,
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.plan.count({ where }),
    ]);

    // Stats across all user's plans, not just the filtered page
    const [totalActive, totalCreated] = await Promise.all([
      prisma.plan.count({
        where: {
          receiverId: userId,
          status: "ACTIVE",
        },
      }),
      prisma.plan.count({
        where: {
          receiverId: userId,
        },
      }),
    ]);

    const links = plans.map(transformPlanToCheckoutLink);

    const revenueAggregate = await prisma.paymentExecution.aggregate({
      where: {
        planId: { in: plans.map((p) => p.id) },
        status: "SUCCESS",
      },
      _sum: {
        amount: true,
      },
    });

    const totalRevenue = revenueAggregate._sum.amount
      ? parseFloat(revenueAggregate._sum.amount.toString())
      : 0;

    return reply.code(200).send({
      links,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total,
        totalPages: Math.ceil(total / validatedQuery.limit),
      },
      stats: {
        totalActive,
        totalCreated,
        averageConversion: 0, // Not tracked yet
        totalRevenue,
        totalRevenueUSD: totalRevenue, // USDC/USDT are already in USD
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

export const getPlanByIdController = async (
  request: FastifyRequest<{ Params: PlanIdParam }>,
  reply: FastifyReply
) => {
  try {
    const validatedParams = planIdParamSchema.parse(request.params);
    const userId = request.user.userId;

    const plan = await prisma.plan.findUnique({
      where: {
        id: validatedParams.id,
      },
      include: {
        receiver: true,
        planTokens: true,
        _count: {
          select: {
            paymentExecutions: true,
          },
        },
      },
    });

    if (!plan || plan.receiverId !== userId) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payment link not found",
      });
    }

    const link = transformPlanToCheckoutLink(plan);

    return reply.code(200).send({ link });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid plan ID",
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

export const getPublicPlanByIdController = async (
  request: FastifyRequest<{ Params: PlanIdParam }>,
  reply: FastifyReply
) => {
  try {
    const validatedParams = planIdParamSchema.parse(request.params);

    const plan = await prisma.plan.findUnique({
      where: {
        id: validatedParams.id,
      },
      include: {
        receiver: true,
        planTokens: true,
        _count: {
          select: {
            paymentExecutions: true,
          },
        },
      },
    });

    if (!plan) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payment link not found",
      });
    }

    if (plan.status !== "ACTIVE") {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payment link is not active",
      });
    }

    if (plan.expiresAt && plan.expiresAt < new Date()) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payment link has expired",
      });
    }

    const link = transformPlanToCheckoutLink(plan);

    return reply.code(200).send({ link });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid plan ID",
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

export const updatePlanController = async (
  request: FastifyRequest<{ Params: PlanIdParam; Body: UpdatePlanBody }>,
  reply: FastifyReply
) => {
  try {
    const validatedParams = planIdParamSchema.parse(request.params);
    const validatedData = updatePlanSchema.parse(request.body);
    const userId = request.user.userId;

    const existingPlan = await prisma.plan.findUnique({
      where: { id: validatedParams.id },
    });

    if (!existingPlan || existingPlan.receiverId !== userId) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payment link not found",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPlan = await tx.plan.update({
        where: { id: validatedParams.id },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.description !== undefined && {
            description: validatedData.description,
          }),
          ...(validatedData.status && { status: validatedData.status }),
          ...(validatedData.redirectUrl !== undefined && {
            redirectUrl: validatedData.redirectUrl,
          }),
          ...(validatedData.expiresAt !== undefined && {
            expiresAt: validatedData.expiresAt
              ? new Date(validatedData.expiresAt)
              : null,
          }),
        },
      });

      if (validatedData.tokenPrices) {
        await tx.planToken.deleteMany({
          where: { planId: validatedParams.id },
        });

        const enrichedTokenPrices = validatedData.tokenPrices.map(
          (tokenPrice) => {
            const tokenConfig = getTokenConfig(tokenPrice.token);
            if (!tokenConfig) {
              throw new Error(
                `Token ${tokenPrice.token} not found in configuration`
              );
            }
            return {
              planId: validatedParams.id,
              symbol: tokenConfig.symbol,
              tokenMint: tokenConfig.mint,
              tokenDecimals: tokenConfig.decimals,
              price: tokenPrice.price,
            };
          }
        );

        await tx.planToken.createMany({
          data: enrichedTokenPrices,
        });
      }

      const planWithRelations = await tx.plan.findUnique({
        where: { id: validatedParams.id },
        include: {
          receiver: true,
          planTokens: true,
          _count: {
            select: {
              paymentExecutions: true,
            },
          },
        },
      });

      return planWithRelations;
    });

    if (!result) {
      return reply.code(500).send({
        statusCode: 500,
        error: "Internal Server Error",
        message: "Failed to update payment link",
      });
    }

    const link = transformPlanToCheckoutLink(result);

    return reply.code(200).send({ link });
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
