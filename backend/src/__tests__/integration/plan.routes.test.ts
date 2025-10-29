import { type FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../db.js";
import { buildTestApp } from "../helpers/app.js";

describe("Plan Routes Integration Tests", () => {
  let fastify: FastifyInstance;
  let authToken: string;
  let testReceiverId: string;

  beforeAll(async () => {
    fastify = await buildTestApp();

    const receiver = await prisma.receiver.create({
      data: {
        name: "Test Receiver",
        email: "test-plan@example.com",
        passwordHash: "hashed_password",
        authMethod: "EMAIL_PASSWORD",
        walletAddress: "TestWalletAddress12345678901234567890",
        tokenAccountUSDT: "TestUSDTAccount1234567890123456789012",
        tokenAccountUSDC: "TestUSDCAccount1234567890123456789012",
      },
    });

    testReceiverId = receiver.id;
    authToken = fastify.jwt.sign({
      userId: testReceiverId,
      email: receiver.email,
      authMethod: receiver.authMethod,
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.plan.deleteMany({
      where: { receiverId: testReceiverId },
    });
    await prisma.receiver.delete({
      where: { id: testReceiverId },
    });

    await fastify.close();
  });

  describe("POST /api/links", () => {
    it("should create a one-time payment link", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/api/links",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: "One-time Test Payment",
          description: "Test description",
          redirectUrl: "https://example.com/success",
          isRecurring: false,
          tokenPrices: [
            {
              token: "USDT",
              price: 10.0,
            },
          ],
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.link).toBeDefined();
      expect(body.link.name).toBe("One-time Test Payment");
      expect(body.link.isRecurring).toBe(false);
      expect(body.link.url).toContain("/payment/");
      expect(body.link.tokenPrices).toHaveLength(1);
      expect(body.link.tokenPrices[0].token).toBe("USDT");
    });

    it("should create a recurring payment link", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/api/links",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: "Monthly Subscription Test",
          description: "Test subscription",
          redirectUrl: "https://example.com/success",
          isRecurring: true,
          durationMonths: 1,
          periodSeconds: 2592000,
          tokenPrices: [
            {
              token: "USDT",
              price: 25.0,
            },
            {
              token: "USDC",
              price: 25.0,
            },
          ],
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.link.isRecurring).toBe(true);
      expect(body.link.durationMonths).toBe(1);
      expect(body.link.periodSeconds).toBe(2592000);
      expect(body.link.tokenPrices).toHaveLength(2);
    });

    it("should reject request without authentication", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/api/links",
        payload: {
          name: "Test Plan",
          isRecurring: false,
          tokenPrices: [
            {
              token: "USDT",
              price: 10.0,
            },
          ],
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject invalid plan data", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/api/links",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: "Test Plan",
          isRecurring: true,
          // Missing required durationMonths and periodSeconds
          tokenPrices: [
            {
              token: "USDT",
              price: 10.0,
            },
          ],
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject invalid token symbol", async () => {
      const response = await fastify.inject({
        method: "POST",
        url: "/api/links",
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: "Test Plan",
          isRecurring: false,
          tokenPrices: [
            {
              token: "INVALID_TOKEN",
              price: 10.0,
            },
          ],
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
