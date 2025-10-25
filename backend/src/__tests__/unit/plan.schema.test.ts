import { describe, expect, it } from "vitest";
import { createPlanSchema } from "../../schemas/plan.schema.js";

describe("Plan Schema Validation", () => {
  describe("createPlanSchema", () => {
    it("should validate a valid one-time payment plan", () => {
      const validData = {
        name: "One-time Payment",
        description: "Test description",
        redirectUrl: "https://example.com/success",
        isRecurring: false,
        tokenPrices: [
          {
            token: "USDT",
            price: 10.0,
          },
        ],
      };

      const result = createPlanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should validate a valid recurring payment plan", () => {
      const validData = {
        name: "Monthly Subscription",
        description: "Test subscription",
        redirectUrl: "https://example.com/success",
        isRecurring: true,
        durationMonths: 1,
        periodSeconds: 2592000,
        tokenPrices: [
          {
            token: "USDC",
            price: 25.0,
          },
        ],
      };

      const result = createPlanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject recurring plan without duration fields", () => {
      const invalidData = {
        name: "Monthly Subscription",
        isRecurring: true,
        tokenPrices: [
          {
            token: "USDT",
            price: 25.0,
          },
        ],
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid redirect URL", () => {
      const invalidData = {
        name: "Test Plan",
        redirectUrl: "not-a-valid-url",
        isRecurring: false,
        tokenPrices: [
          {
            token: "USDT",
            price: 10.0,
          },
        ],
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty token prices array", () => {
      const invalidData = {
        name: "Test Plan",
        isRecurring: false,
        tokenPrices: [],
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative token price", () => {
      const invalidData = {
        name: "Test Plan",
        isRecurring: false,
        tokenPrices: [
          {
            token: "USDT",
            price: -10.0,
          },
        ],
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid token symbol", () => {
      const invalidData = {
        name: "Test Plan",
        isRecurring: false,
        tokenPrices: [
          {
            token: "INVALID_TOKEN",
            price: 10.0,
          },
        ],
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject duplicate token symbols", () => {
      const invalidData = {
        name: "Test Plan",
        isRecurring: false,
        tokenPrices: [
          {
            token: "USDT",
            price: 10.0,
          },
          {
            token: "USDT",
            price: 15.0,
          },
        ],
      };

      const result = createPlanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept multiple different token symbols", () => {
      const validData = {
        name: "Test Plan",
        isRecurring: false,
        tokenPrices: [
          {
            token: "USDT",
            price: 10.0,
          },
          {
            token: "USDC",
            price: 10.0,
          },
        ],
      };

      const result = createPlanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
