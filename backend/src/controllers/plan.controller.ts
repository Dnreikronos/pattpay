import { type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";
import { getTokenConfig } from "../constants/tokens.js";
import { prisma } from "../db.js";
import {
  type CreatePlanBody,
  createPlanSchema,
} from "../schemas/plan.schema.js";

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
