import type { Prisma } from "@prisma/client";
import { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  type CreatePaymentExecutionBody,
  createPaymentExecutionSchema,
  type GetPaymentExecutionsQuery,
  getPaymentExecutionsQuerySchema,
  type PaymentExecutionIdParam,
  paymentExecutionIdParamSchema,
} from "../schemas/payment-execution.schema.js";
import { verifyOneTimePayment } from "../services/solana.service.js";

export const createPaymentExecution = async (
  request: FastifyRequest<{ Body: CreatePaymentExecutionBody }>,
  reply: FastifyReply
) => {
  try {
    const validatedData = createPaymentExecutionSchema.parse(request.body);

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

    if (plan.isRecurring) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          "This endpoint is only for one-time payments. Recurring subscription payments are handled automatically by the relayer.",
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

    const existingPayment = await prisma.paymentExecution.findFirst({
      where: { txSignature: validatedData.txSignature },
    });

    if (existingPayment) {
      return reply.code(409).send({
        statusCode: 409,
        error: "Conflict",
        message:
          "Payment execution with this transaction signature already exists",
        paymentExecutionId: existingPayment.id,
      });
    }

    const verification = await verifyOneTimePayment({
      txSignature: validatedData.txSignature,
      expectedTokenMint: validatedData.tokenMint,
      expectedAmount: validatedData.amount,
      expectedReceiverWallet: plan.receiver.walletAddress,
      tokenDecimals: planToken.tokenDecimals,
    });

    const status = verification.valid ? "SUCCESS" : "FAILED";

    const paymentExecution = await prisma.paymentExecution.create({
      data: {
        planId: validatedData.planId,
        subscriptionId: null,
        txSignature: validatedData.txSignature,
        executedBy: validatedData.executedBy ?? null,
        status,
        executedAt: new Date(),
        tokenMint: validatedData.tokenMint,
        amount: validatedData.amount,
        errorMessage: verification.valid ? null : verification.reason ?? null,
      },
      include: {
        plan: {
          include: {
            planTokens: true,
            receiver: true,
          },
        },
      },
    });

    if (!verification.valid) {
      request.log.warn(
        `Payment verification failed for plan ${plan.id} (tx: ${validatedData.txSignature}): ${verification.reason}`
      );

      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: `Transaction verification failed: ${verification.reason}`,
        paymentExecutionId: paymentExecution.id,
      });
    }

    request.log.info(
      `Payment verified and recorded: ${paymentExecution.id} for plan ${plan.id} (tx: ${validatedData.txSignature})`
    );

    return reply.code(201).send({
      message: "Payment verified and recorded successfully",
      paymentExecution,
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

export const getPaymentExecutions = async (
  request: FastifyRequest<{ Querystring: GetPaymentExecutionsQuery }>,
  reply: FastifyReply
) => {
  try {
    const validatedQuery = getPaymentExecutionsQuerySchema.parse(request.query);
    const userId = request.user.userId;

    const where: Prisma.PaymentExecutionWhereInput = {
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
      where.tokenMint = validatedQuery.tokenMint;
    }

    if (validatedQuery.dateFrom || validatedQuery.dateTo) {
      where.executedAt = {};
      if (validatedQuery.dateFrom) {
        where.executedAt.gte = validatedQuery.dateFrom;
      }
      if (validatedQuery.dateTo) {
        where.executedAt.lte = validatedQuery.dateTo;
      }
    }

    if (validatedQuery.search) {
      where.txSignature = {
        contains: validatedQuery.search,
        mode: "insensitive",
      };
    }

    const skip = (validatedQuery.page - 1) * validatedQuery.limit;
    const take = validatedQuery.limit;

    const [paymentExecutions, total] = await Promise.all([
      prisma.paymentExecution.findMany({
        where,
        skip,
        take,
        include: {
          plan: {
            include: {
              planTokens: true,
            },
          },
          subscription: true,
        },
        orderBy: { executedAt: "desc" },
      }),
      prisma.paymentExecution.count({ where }),
    ]);

    return reply.code(200).send({
      data: paymentExecutions,
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

export const getPaymentExecution = async (
  request: FastifyRequest<{ Params: PaymentExecutionIdParam }>,
  reply: FastifyReply
) => {
  try {
    const validatedParams = paymentExecutionIdParamSchema.parse(request.params);
    const userId = request.user.userId;

    const paymentExecution = await prisma.paymentExecution.findUnique({
      where: { id: validatedParams.id },
      include: {
        plan: {
          include: {
            planTokens: true,
            receiver: true,
          },
        },
        subscription: {
          include: {
            payer: true,
          },
        },
      },
    });

    if (!paymentExecution) {
      return reply.code(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Payment execution not found",
      });
    }

    if (paymentExecution.plan?.receiverId !== userId) {
      return reply.code(403).send({
        statusCode: 403,
        error: "Forbidden",
        message: "You do not have permission to view this payment execution",
      });
    }

    return reply.code(200).send(paymentExecution);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid payment execution ID",
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
