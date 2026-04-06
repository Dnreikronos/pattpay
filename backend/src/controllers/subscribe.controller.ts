import { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  type SubscribeBody,
  subscribeSchema,
} from "../schemas/subscribe.schema.js";
import { verifyDelegationTransaction } from "../services/solana.service.js";

export const subscribe = async (
  request: FastifyRequest<{ Body: SubscribeBody }>,
  reply: FastifyReply
) => {
  try {
    const validatedData = subscribeSchema.parse(request.body);

    const plan = await prisma.plan.findUnique({
      where: { id: validatedData.planId },
      include: { planTokens: true, receiver: true },
    });

    if (!plan) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Plan not found",
      });
    }

    if (!plan.isRecurring) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          "This endpoint is only for recurring plans. One-time payments should be handled on the frontend.",
      });
    }

    if (plan.status !== "ACTIVE") {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Plan is not active",
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

    // Same wallet can subscribe with different identities (personal vs business)
    let payer = await prisma.payer.findUnique({
      where: {
        walletAddress_name: {
          walletAddress: validatedData.payer.walletAddress,
          name: validatedData.payer.name,
        },
      },
    });

    if (!payer) {
      payer = await prisma.payer.create({
        data: {
          walletAddress: validatedData.payer.walletAddress,
          name: validatedData.payer.name,
          email: validatedData.payer.email ?? null,
        },
      });

      request.log.info(
        `Created new payer: ${payer.id} (${payer.walletAddress}, ${payer.name})`
      );
    } else {
      request.log.info(
        `Using existing payer: ${payer.id} (${payer.walletAddress}, ${payer.name})`
      );
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        payerId: payer.id,
        planId: validatedData.planId,
        status: "ACTIVE",
      },
    });

    if (existingSubscription) {
      return reply.code(409).send({
        statusCode: 409,
        error: "Conflict",
        message:
          "An active subscription already exists for this payer and plan",
        subscriptionId: existingSubscription.id,
      });
    }

    const verification = await verifyDelegationTransaction({
      txSignature: validatedData.delegateTxSignature,
      expectedPayerWallet: validatedData.payer.walletAddress,
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
        payerId: payer.id,
        tokenMint: validatedData.tokenMint,
        status: "ACTIVE",
        nextDueAt,
        lastPaidAt: now, // First payment is considered paid via delegation approval
        delegateAuthority: validatedData.delegateAuthority,
        delegateTxSignature: validatedData.delegateTxSignature,
        delegateApprovedAt: new Date(validatedData.delegateApprovedAt),
        tokenDecimals: planToken.tokenDecimals,
        totalApprovedAmount,
      },
      include: {
        plan: {
          include: {
            planTokens: true,
            receiver: true,
          },
        },
        payer: true,
      },
    });

    request.log.info(
      `Created subscription: ${subscription.id} for payer ${payer.id} on plan ${plan.id}`
    );

    return reply.code(201).send({
      message: "Subscription created successfully",
      subscription,
      payer: {
        id: payer.id,
        walletAddress: payer.walletAddress,
        name: payer.name,
        email: payer.email,
        isNew: !existingSubscription, // Indicates if this was a newly created payer
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
