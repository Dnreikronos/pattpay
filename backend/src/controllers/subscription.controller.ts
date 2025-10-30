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

