/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock InterventionService before importing controller
vi.mock("@/app/api/intervention/service/intervention.service", () => ({
  InterventionService: class {
    findAll = vi.fn();
    findAllSimple = vi.fn();
    findUsersInvolvedInIntervention = vi.fn();
    findAllPathologiesbyId = vi.fn();
    findAllDogsbyId = vi.fn();
    evaluate = vi.fn();
  },
}));

vi.mock("next/server", () => ({ NextResponse: { json: vi.fn((data: unknown, opts?: ResponseInit) => ({ data, ...opts })) } }));

import { InterventionController } from "./intervention.controller";
import { InterventionService } from "@/app/api/intervention/service/intervention.service";

describe("InterventionController (unit)", () => {
  let controller: InterventionController;
  let svc: any;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new (InterventionService as any)();
    controller = new InterventionController(svc);
  });

  it("getPathologies returns pathologies when service resolves", async () => {
    const id = "int-1";
    const mock = [{ id: "p1", nombre: "X" }];
    svc.findAllPathologiesbyId.mockResolvedValue(mock);

    const res = await controller.getPathologies(id);
    expect(svc.findAllPathologiesbyId).toHaveBeenCalledWith(id);
    expect(res).toEqual(mock);
  });

  it("getPathologies returns error NextResponse on service error", async () => {
    const id = "int-err";
    svc.findAllPathologiesbyId.mockRejectedValue(new Error("boom"));

    const res = await controller.getPathologies(id);
    // NextResponse.json returns object per our mock
    expect(res).toHaveProperty("status");
    expect((res as any).status).toBe(500);
  });

  it("evaluateIntervention parses formData and calls service.evaluate", async () => {
    const id = "int-eval";
    const patients = [{ ci: "1" }];
    const experiences: never[] = [];
    const pictures: any[] = [];
    const driveLink = "";

    const fakeForm = {
      get: (k: string) => {
        if (k === "patients") return JSON.stringify(patients);
        if (k === "experiences") return JSON.stringify(experiences);
        if (k === "driveLink") return driveLink;
        return null;
      },
      getAll: (k: string) => (k === "photos" ? pictures : []),
    };

    const req: any = { formData: vi.fn().mockResolvedValue(fakeForm) };
    svc.evaluate.mockResolvedValue({ ok: true });

    const result = await controller.evaluateIntervention(req, id);
    expect(svc.evaluate).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it("getIntervenciones delegates to service.findAll", async () => {
    const pagination: any = { page: 1, size: 10, getOffset: () => 0, getOrder: () => [] };
    const payload: any = { ci: "x" };
    svc.findAll.mockResolvedValue({ data: [], count: 0 });

    const res = await controller.getIntervenciones(pagination, payload, null, null);
    expect(svc.findAll).toHaveBeenCalledWith(pagination, payload, null, null);
    expect(res).toEqual({ data: [], count: 0 });
  });
});
