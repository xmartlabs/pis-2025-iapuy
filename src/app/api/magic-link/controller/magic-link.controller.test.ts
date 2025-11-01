/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the service before importing the controller
vi.mock("@/app/api/magic-link/service/magic-link.service", () => ({
  MagicLinkService: class {
    createResetTokenForUser = vi.fn();
    resetPasword = vi.fn();
  },
}));

import { MagicLinkController } from "./magic-link.controller";
import { MagicLinkService } from "@/app/api/magic-link/service/magic-link.service";

describe("MagicLinkController (unit)", () => {
  let controller: MagicLinkController;
  let svc: any;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new (MagicLinkService as any)();
    controller = new MagicLinkController(svc);
  });

  it("createMagicLink should build a URL with token and expiration", async () => {
    const ci = "123";
    const nombre = "John";
    const token = "tok";
    const expiresAt = new Date("2025-11-01T10:00:00.000Z");

    svc.createResetTokenForUser.mockResolvedValue({ token, expiresAt });

    const url = await controller.createMagicLink(ci, nombre);
    expect(svc.createResetTokenForUser).toHaveBeenCalledWith(ci);
    expect(url).toContain(`token=${token}`);
    expect(url).toContain(`expiresAt=${expiresAt.toISOString()}`);
  });

  it("changePassword should call service.resetPasword and propagate errors", async () => {
    const token = "t";
    const newPass = "NewPass1";
    svc.resetPasword.mockResolvedValue(undefined);

    await controller.changePassword(token, newPass);
    expect(svc.resetPasword).toHaveBeenCalledWith(token, newPass);

    svc.resetPasword.mockRejectedValue(new Error("Bad token"));
    await expect(controller.changePassword(token, newPass)).rejects.toThrow("Bad token");
  });
});
