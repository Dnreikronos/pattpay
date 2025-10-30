import { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  type SubscribeBody,
  subscribeSchema,
} from "../schemas/subscribe.schema.js";

/**
 * Subscribe endpoint - Simplified workflow for recurring subscriptions
 *
 * This endpoint:
 * 1. Checks if payer exists by wallet address (creates if not)
 * 2. Verifies that the plan is recurring
 * 3. Creates the subscription
 *
 * This should ONLY be used for recurring plans. One-time payments are handled
 * on the frontend with the user's wallet, then stored in payment_executions table.
 */
export const subscribe = async (
  request: FastifyRequest<{ Body: SubscribeBody }>,
  reply: FastifyReply
) => {
  try {
    const validatedData = subscribeSchema.parse(request.body);

    // Step 1: Check if the plan exists and is recurring
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

    // Step 2: Verify this is a recurring plan
    if (!plan.isRecurring) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          "This endpoint is only for recurring plans. One-time payments should be handled on the frontend.",
      });
    }

    // Verify the plan is active
    if (plan.status !== "ACTIVE") {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Plan is not active",
      });
    }

    // Step 3: Verify the token is supported by this plan
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

    // Step 4: Check if payer exists by wallet address AND name, create if not
    // This allows the same wallet to subscribe to different plans with different identities
    // (e.g., personal vs business subscriptions)
    let payer = await prisma.payer.findUnique({
      where: {
        walletAddress_name: {
          walletAddress: validatedData.payer.walletAddress,
          name: validatedData.payer.name,
        },
      },
    });

    if (!payer) {
      // Create new payer with this wallet + name combination
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

    // Step 5: Check if an active subscription already exists for this payer and plan
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

    // Step 6: Calculate subscription details
    const now = new Date();
    const nextDueAt = new Date(now);

    if (plan.periodSeconds) {
      nextDueAt.setSeconds(nextDueAt.getSeconds() + plan.periodSeconds);
    }

    // Calculate total approved amount (price * durationMonths)
    const totalApprovedAmount = plan.durationMonths
      ? planToken.price.toNumber() * plan.durationMonths
      : planToken.price;

    // Step 7: Create the subscription
    const subscription = await prisma.subscription.create({
      data: {
        planId: validatedData.planId,
        payerId: payer.id,
        token_mint: validatedData.tokenMint,
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
