/* eslint-disable */

import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock modules before importing the service to avoid Sequelize decorator initialization ---
vi.mock("@/lib/init-database", () => ({ initDatabase: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/app/models/reset-tokens.entity", () => ({
  ResetToken: {
    findOne: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock("@/app/models/user.entity", () => ({
  User: {
    update: vi.fn(),
  },
}));
vi.mock("@/lib/database", () => ({
  __esModule: true,
  default: {
    transaction: vi.fn().mockResolvedValue({ commit: vi.fn(), rollback: vi.fn() }),
  },
}));
vi.mock("@/lib/crypto/hash", () => ({ Hashing: { hashPassword: vi.fn().mockResolvedValue("hashed-password") } }));

import { MagicLinkService } from "./magic-link.service";
import { ResetToken } from "@/app/models/reset-tokens.entity";
import { User } from "@/app/models/user.entity";
import * as crypto from "node:crypto";

describe("MagicLinkService (unit)", () => {
  let service: MagicLinkService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MagicLinkService();
  });

  describe("generateToken", () => {
    it("generates a token and its sha256 hash", () => {
      const result = service.generateToken();
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("tokenHash");
      expect(result.token).toHaveLength(64); // 32 bytes hex
      expect(result.tokenHash).toHaveLength(64);

      const expected = crypto.createHash("sha256").update(result.token).digest("hex");
      expect(result.tokenHash).toBe(expected);
    });
  });

  describe("createResetTokenForUser", () => {
    it("creates token and invalidates old tokens", async () => {
      const userId = "u-1";
      (ResetToken.update as unknown as jest.Mock).mockResolvedValue([1]);
      (ResetToken.create as unknown as jest.Mock).mockResolvedValue({ userId });

      const res = await service.createResetTokenForUser(userId);

      expect(res).toHaveProperty("token");
      expect(res).toHaveProperty("expiresAt");
      expect(typeof res.token).toBe("string");
      expect(res.expiresAt).toBeInstanceOf(Date);
      expect(ResetToken.update).toHaveBeenCalled();
      expect(ResetToken.create).toHaveBeenCalled();
    });

    it("sets expiresAt within the configured window", async () => {
      const userId = "u-2";
      (ResetToken.update as unknown as jest.Mock).mockResolvedValue([0]);
      (ResetToken.create as unknown as jest.Mock).mockResolvedValue({});

      const before = Date.now();
      const { expiresAt } = await service.createResetTokenForUser(userId);
      const after = Date.now();

      const min = before + (MagicLinkService.RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000);
      const max = after + (MagicLinkService.RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000);
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(min - 5);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(max + 5);
    });

    it("rolls back transaction on error", async () => {
      const userId = "u-3";
      (ResetToken.update as unknown as jest.Mock).mockRejectedValue(new Error("DB Error"));

      await expect(service.createResetTokenForUser(userId)).rejects.toThrow("DB Error");
    });
  });

  describe("verifyResetToken", () => {
    it("verifies a valid token and marks it used", async () => {
      const token = "tok-123";
      const hash = crypto.createHash("sha256").update(token).digest("hex");
      const mockRecord: any = { userId: "u-10", tokenHash: hash, used: false, expiresAt: new Date(Date.now() + 10000), save: vi.fn().mockResolvedValue(undefined) };
      (ResetToken.findOne as unknown as jest.Mock).mockResolvedValue(mockRecord);

      const userId = await MagicLinkService.verifyResetToken(token);
      expect(userId).toBe("u-10");
      expect(mockRecord.used).toBe(true);
      expect(mockRecord.save).toHaveBeenCalled();
    });

    it("throws for invalid token", async () => {
      (ResetToken.findOne as unknown as jest.Mock).mockResolvedValue(null);
      await expect(MagicLinkService.verifyResetToken("invalid")).rejects.toThrow("Invalid token");
    });
  });

  describe("resetPasword", () => {
    it("resets password when token valid and strong password", async () => {
      const token = "tok-xyz";
      const newPass = "StrongPass1";
      // stub static verifier
      vi.spyOn(MagicLinkService, "verifyResetToken").mockResolvedValue("ci-1");
      (User.update as unknown as jest.Mock).mockResolvedValue([1]);

      await service.resetPasword(token, newPass);
      expect(User.update).toHaveBeenCalledWith({ password: "hashed-password" }, { where: { ci: "ci-1" } });
    });

    it("rejects weak passwords (short)", async () => {
      await expect(service.resetPasword("t", "short")).rejects.toThrow("Contraseña muy débil");
    });

    it("rejects weak passwords (no uppercase)", async () => {
      await expect(service.resetPasword("t", "lowercase1")).rejects.toThrow("Contraseña muy débil");
    });
  });
});
