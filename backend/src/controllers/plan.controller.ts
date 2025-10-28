import type { Prisma } from "@prisma/client";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
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
    const validatedData = createPlanSchema.parse(request.body);
    const userId = request.user.userId;

    // Verify receiver exists
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

    // Validate and enrich token prices with mint addresses and decimals
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

    // Create plan with token prices in transaction
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

      // Create plan tokens with symbol stored in DB
      await tx.planToken.createMany({
        data: enrichedTokenPrices.map((token) => ({
          planId: plan.id,
          symbol: token.symbol,
          tokenMint: token.tokenMint,
          tokenDecimals: token.tokenDecimals,
          price: token.price,
        })),
      });

      // Fetch created tokens for response
      const createdTokens = await tx.planToken.findMany({
        where: { planId: plan.id },
      });

      return { plan, tokens: createdTokens };
    });

    // Generate payment link URL
    const paymentUrl = `${process.env.FRONTEND_URL}/payment/${result.plan.id}`;

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

    // Build where clause for filters
    const where: Prisma.PlanWhereInput = {
      receiverId: userId,
    };

    // Status filter
    if (validatedQuery.status !== "all") {
      where.status = validatedQuery.status;
    }

    // Recurring filter
    if (validatedQuery.isRecurring !== "all") {
      where.isRecurring = validatedQuery.isRecurring === "true" ? true : false;
    }

    // Search filter (name contains, case-insensitive)
    if (validatedQuery.search) {
      where.name = {
        contains: validatedQuery.search,
        mode: "insensitive",
      };
    }

    // Calculate pagination
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;
    const take = validatedQuery.limit;

    // Query plans with relations and count
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

    // Calculate stats from all user's plans (not just filtered)
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

    // Transform plans to frontend format
    const links = plans.map(transformPlanToCheckoutLink);

    // Calculate total revenue from actual payment executions
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

    // Query plan with relations
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

    // Check if plan exists and belongs to user
    if (!plan || plan.receiverId !== userId) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payment link not found",
      });
    }

    // Transform to frontend format
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

    // Check if plan exists and belongs to user
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

    // Update plan and token prices in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update plan
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

      // If token prices provided, replace them
      if (validatedData.tokenPrices) {
        // Delete existing tokens
        await tx.planToken.deleteMany({
          where: { planId: validatedParams.id },
        });

        // Enrich and create new tokens
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

      // Fetch updated plan with relations
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

    // Transform to frontend format
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
