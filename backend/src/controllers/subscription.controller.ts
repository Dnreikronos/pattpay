import type { Prisma } from "@prisma/client";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  type CreateSubscriptionBody,
  createSubscriptionSchema,
  type GetSubscriptionQuery,
  getSubscriptionsQuerySchema,
  type subscriptionIdParam,
  subscriptionIdParamSchema,
  type CancelSubscriptionBody,
  cancelSubscriptionSchema,
} from "../schemas/subscription.schema.js";

export const createSubscription = async (
  request: FastifyRequest<{ Body: CreateSubscriptionBody }>,
  reply: FastifyReply
) => {
  try {
    const validatedData = createSubscriptionSchema.parse(request.body);

    const plan = await prisma.plan.findUnique({
      where: { id: validatedData.planId },
      include: { planTokens: true },
    });

    if (!plan) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Plan not found",
      });
    }

    const payer = await prisma.payer.findUnique({
      where: { id: validatedData.payerId },
    });

    if (!payer) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payer not found. Create payer via POST /api/payers first.",
      });
    }

    // Verify the token is supported by this plan
    const planToken = plan.planTokens.find(
      (t) => t.tokenMint === validatedData.tokenMint
    );

    if (!planToken) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Token not supported by this plan",
      });
    }

    // Calculate when the next payment is due
    const now = new Date();
    const nextDueAt = new Date(now);
    if (plan.periodSeconds) {
      nextDueAt.setSeconds(nextDueAt.getSeconds() + plan.periodSeconds);
    }

    // Calculate total approved amount
    // For recurring: price * durationMonths
    // For one-time: just the price
    const totalApprovedAmount = plan.durationMonths
      ? planToken.price.toNumber() * plan.durationMonths
      : planToken.price;

    // Create the subscription record
    const subscription = await prisma.subscription.create({
      data: {
        planId: validatedData.planId,
        payerId: validatedData.payerId,
        token_mint: validatedData.tokenMint,
        status: "ACTIVE",
        nextDueAt,
        lastPaidAt: now, // First payment is considered paid via delegation approval
        delegateAuthority: validatedData.delegateAuthority, // PDA address for relayer to use
        delegateTxSignature: validatedData.delegateTxSignature, // Proof of on-chain delegation
        delegateApprovedAt: new Date(validatedData.delegateApprovedAt),
        tokenDecimals: planToken.tokenDecimals,
        totalApprovedAmount,
      },
      include: {
        plan: { include: { planTokens: true } },
        payer: true,
      },
    });

    return reply.code(201).send(subscription);
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

export const getSubscriptions = async (
  request: FastifyRequest<{ Querystring: GetSubscriptionQuery }>,
  reply: FastifyReply
) => {
  try {
    const validatedQuery = getSubscriptionsQuerySchema.parse(request.query);
    const userId = request.user.userId;

    // Build query filters
    const where: Prisma.SubscriptionWhereInput = {
      plan: {
        receiverId: userId, // Only show subscriptions for this receiver's plans
      },
    };

    // Status filter
    if (validatedQuery.status !== "all") {
      where.status = validatedQuery.status;
    }

    // Plan filter
    if (validatedQuery.planId) {
      where.planId = validatedQuery.planId;
    }

    // Token type filter
    if (validatedQuery.tokenMint) {
      where.token_mint = validatedQuery.tokenMint;
    }

    // Date range filter
    if (validatedQuery.dateFrom || validatedQuery.dateTo) {
      where.createdAt = {};
      if (validatedQuery.dateFrom) {
        where.createdAt.gte = validatedQuery.dateFrom;
      }
      if (validatedQuery.dateTo) {
        where.createdAt.lte = validatedQuery.dateTo;
      }
    }

    // Search across payer and plan information
    if (validatedQuery.search) {
      where.OR = [
        {
          payer: {
            OR: [
              {
                name: {
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
            ],
          },
        },
        {
          plan: {
            name: {
              contains: validatedQuery.search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const skip = (validatedQuery.page - 1) * validatedQuery.limit;
    const take = validatedQuery.limit;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take,
        include: {
          plan: { include: { planTokens: true } },
          payer: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.subscription.count({ where }),
    ]);

    return reply.code(200).send({
      data: subscriptions,
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

export const getSubscription = async (
  request: FastifyRequest<{ Params: subscriptionIdParam }>,
  reply: FastifyReply
) => {
  try {
    const validatedParams = subscriptionIdParamSchema.parse(request.params);
    const userId = request.user.userId;

    const subscription = await prisma.subscription.findUnique({
      where: { id: validatedParams.id },
      include: {
        plan: { include: { planTokens: true, receiver: true } },
        payer: true,
        paymentExecutions: { orderBy: { executedAt: "desc" }, take: 10 },
      },
    });

    if (!subscription || subscription.plan.receiverId !== userId) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Subscription not found",
      });
    }

    return reply.code(200).send(subscription);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid subscription ID",
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

export const cancelSubscription = async (
  request: FastifyRequest<{
    Params: subscriptionIdParam;
    Body: CancelSubscriptionBody;
  }>,
  reply: FastifyReply
) => {
  try {
    const validatedParams = subscriptionIdParamSchema.parse(request.params);
    const validatedData = cancelSubscriptionSchema.parse(request.body);
    const userId = request.user.userId;

    const subscription = await prisma.subscription.findUnique({
      where: { id: validatedParams.id },
      include: { plan: true },
    });

    if (!subscription || subscription.plan.receiverId !== userId) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Subscription not found",
      });
    }

    if (subscription.status === "CANCELLED") {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Subscription already cancelled",
      });
    }

    // TODO: Verify revokeTxSignature on-chain to ensure:
    // 1. Transaction is valid and confirmed
    // 2. Transaction called revoke_delegate with correct subscription_id
    // 3. Transaction was signed by the original payer
    // This prevents malicious cancellations without actual on-chain revocation

    const updated = await prisma.subscription.update({
      where: { id: validatedParams.id },
      data: {
        status: "CANCELLED",
      },
      include: {
        plan: { include: { planTokens: true } },
        payer: true,
      },
    });

    return reply.code(200).send(updated);
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
