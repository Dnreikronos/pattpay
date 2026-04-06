import type { Prisma } from "@prisma/client";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  type CreateSubscriptionBody,
  type CancelSubscriptionBody,
  createSubscriptionSchema,
  cancelSubscriptionSchema,
  type GetSubscriptionQuery,
  getSubscriptionsQuerySchema,
  type subscriptionIdParam,
  subscriptionIdParamSchema,
} from "../schemas/subscription.schema.js";
import {
  verifyDelegationTransaction,
  verifyRevokeTransaction,
} from "../services/solana.service.js";

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

    const verification = await verifyDelegationTransaction({
      txSignature: validatedData.delegateTxSignature,
      expectedPayerWallet: payer.walletAddress,
    });

    if (!verification.valid) {
      request.log.warn(
        `Delegation verification failed for plan ${plan.id}: ${verification.reason}`
      );

      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: `Delegation verification failed: ${verification.reason}`,
      });
    }

    const now = new Date();
    const nextDueAt = new Date(now);
    if (plan.periodSeconds) {
      nextDueAt.setSeconds(nextDueAt.getSeconds() + plan.periodSeconds);
    }

    const totalApprovedAmount = plan.durationMonths
      ? planToken.price.mul(plan.durationMonths)
      : planToken.price;

    const subscription = await prisma.subscription.create({
      data: {
        planId: validatedData.planId,
        payerId: validatedData.payerId,
        token_mint: validatedData.tokenMint,
        status: "ACTIVE",
        nextDueAt,
        lastPaidAt: now,
        delegateAuthority: validatedData.delegateAuthority,
        delegateTxSignature: validatedData.delegateTxSignature,
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

    const where: Prisma.SubscriptionWhereInput = {
      plan: {
        receiverId: userId,
      },
    };

    if (validatedQuery.status !== "all") {
      where.status = validatedQuery.status;
    }

    if (validatedQuery.planId) {
      where.planId = validatedQuery.planId;
    }

    if (validatedQuery.tokenMint) {
      where.token_mint = validatedQuery.tokenMint;
    }

    if (validatedQuery.dateFrom || validatedQuery.dateTo) {
      where.createdAt = {};
      if (validatedQuery.dateFrom) {
        where.createdAt.gte = validatedQuery.dateFrom;
      }
      if (validatedQuery.dateTo) {
        where.createdAt.lte = validatedQuery.dateTo;
      }
    }

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

    if (
      !subscription ||
      (subscription.plan.receiverId !== userId &&
        subscription.payerId !== userId)
    ) {
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
    const validatedBody = cancelSubscriptionSchema.parse(request.body);
    const userId = request.user.userId;

    const subscription = await prisma.subscription.findUnique({
      where: { id: validatedParams.id },
      include: { plan: true, payer: true },
    });

    if (
      !subscription ||
      (subscription.payerId !== userId &&
        subscription.plan.receiverId !== userId)
    ) {
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

    const verification = await verifyRevokeTransaction({
      txSignature: validatedBody.revokeTxSignature,
      expectedPayerWallet: subscription.payer.walletAddress,
      subscriptionId: subscription.id,
    });

    if (!verification.valid) {
      request.log.warn(
        `Revoke verification failed for subscription ${subscription.id}: ${verification.reason}`
      );

      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: `Revoke verification failed: ${verification.reason}`,
      });
    }

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
