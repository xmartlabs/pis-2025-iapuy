/* eslint-disable */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the service before importing the controller
vi.mock("../service/registro-sanidad.service", () => ({
  RegistrosSanidadService: class {
    findAll = vi.fn();
    create = vi.fn();
    delete = vi.fn();
    findOne = vi.fn();
    updateEventoSanidad = vi.fn();
  },
}));

// Mock jwt.decode (provide a default export to match `import jwt from 'jsonwebtoken'`)
vi.mock("jsonwebtoken", () => ({
  default: { decode: vi.fn(() => ({ userId: "u1", roles: [] })) },
}));

import { RegistrosSanidadController } from "./registros-sanidad.controller";
import { RegistrosSanidadService } from "../service/registro-sanidad.service";

describe("RegistrosSanidadController (unit)", () => {
  let controller: RegistrosSanidadController;
  let svc: any;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new (RegistrosSanidadService as any)();
    controller = new RegistrosSanidadController(svc);
  });

  it("createEventoSanidad handles vacuna branch and calls service.create", async () => {
    const fakeForm = {
      get: (k: string) => {
        if (k === "tipoSanidad") return "vacuna";
        if (k === "perroId") return "p1";
        if (k === "fecha") return "2025-11-01";
        if (k === "vac") return "rabia";
        if (k === "medicamento") return "medA";
        if (k === "tipoDesparasitacion") return "Externa";
        if (k === "carneVacunas") return null; // not a File
        return null;
      },
      // not used for photos here
      getAll: () => [],
    };

    const req: any = { formData: vi.fn().mockResolvedValue(fakeForm) };
    svc.create.mockResolvedValue({ id: "r1" });

    const result = await controller.createEventoSanidad(req);
    expect(svc.create).toHaveBeenCalled();
    expect(result).toEqual({ id: "r1" });
  });

  it("deleteRegistroSanidad decodes token and calls service.delete", async () => {
    const headers = new Map<string, string>();
    headers.set("authorization", "Bearer faketoken");
    const req: any = {
      nextUrl: { searchParams: { get: (k: string) => (k === "id" ? "r1" : "act") } },
      headers: { get: (k: string) => headers.get(k) },
    };

    svc.delete.mockResolvedValue({ ok: true });

    const result = await controller.deleteRegistroSanidad(req);
    expect(svc.delete).toHaveBeenCalledWith("r1", "act", { userId: "u1", roles: [] });
    expect(result).toEqual({ ok: true });
  });

  it("updateEventoSanidad uses JSON path and delegates to service", async () => {
    const body = {
      tipoSanidad: "banio",
      eventoId: "e1",
      fecha: "2025-11-01",
      medicamento: "medB",
      tipoDesparasitacion: "Interna",
      vac: "",
      perroId: "p1",
    };

    const req: any = {
      headers: { get: (k: string) => "application/json" },
      json: vi.fn().mockResolvedValue(body),
    };

    svc.updateEventoSanidad.mockResolvedValue({ updated: true });

    const result = await controller.updateEventoSanidad(req, {
        userId: "u1",
        ci: "",
        name: "",
        type: ""
    });
    expect(svc.updateEventoSanidad).toHaveBeenCalled();
    expect(result).toEqual({ updated: true });
  });

  it("updateEventoSanidad throws when tipoSanidad missing", async () => {
    const body = { eventoId: "e1" };
    const req: any = {
      headers: { get: (k: string) => "application/json" },
      json: vi.fn().mockResolvedValue(body),
    };

    await expect(controller.updateEventoSanidad(req, {
        userId: "u1",
        ci: "",
        name: "",
        type: ""
    })).rejects.toThrow("tipoSanidad is required");
  });

  it("updateEventoSanidad throws when eventoId missing", async () => {
    const body = { tipoSanidad: "banio" };
    const req: any = {
      headers: { get: (k: string) => "application/json" },
      json: vi.fn().mockResolvedValue(body),
    };

    await expect(controller.updateEventoSanidad(req, {
        userId: "u1",
        ci: "",
        name: "",
        type: ""
    })).rejects.toThrow("eventoId is required");
  });
});
