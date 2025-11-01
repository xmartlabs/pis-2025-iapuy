/* eslint-disable */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock InscripcionService before importing controller
vi.mock("../service/inscription.service", () => ({
  InscripcionService: class {
    inscribirse = vi.fn();
    listarOpciones = vi.fn();
  },
}));

import { InscripcionController } from "./inscription.controller";
import { InscripcionService } from "../service/inscription.service";

describe("InscripcionController (unit)", () => {
  let controller: InscripcionController;
  let svc: any;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new (InscripcionService as any)();
    controller = new InscripcionController(svc);
  });

  it("postInscripcion delegates to service when valid payload", async () => {
    const payload = { duplas: [{ perro: "p1" }], acompaniantes: [], intervention: "i1" };
    const req: any = { json: vi.fn().mockResolvedValue(payload) };
    svc.inscribirse.mockResolvedValue({ ok: true });

    const res = await controller.postInscripcion(req);
    expect(svc.inscribirse).toHaveBeenCalledWith(payload);
    expect(res).toEqual({ ok: true });
  });

  it("postInscripcion throws when no duplas and no acompanantes", async () => {
    const payload = { duplas: [], acompaniantes: [], intervention: "i1" };
    const req: any = { json: vi.fn().mockResolvedValue(payload) };

    await expect(controller.postInscripcion(req)).rejects.toThrow("Se requiere al menos una inscripcion");
  });

  it("postInscripcion throws when intervention missing", async () => {
    const payload = { duplas: [{ perro: "p1" }], acompaniantes: [] };
    const req: any = { json: vi.fn().mockResolvedValue(payload) };

    await expect(controller.postInscripcion(req)).rejects.toThrow("Id de intervención requerida");
  });

  it("listarOpciones delegates to service", async () => {
    svc.listarOpciones.mockResolvedValue({ pairsQuantity: 1, people: [], perros: [] });
    const res = await controller.listarOpciones("i1");
    expect(svc.listarOpciones).toHaveBeenCalledWith("i1");
    expect(res).toEqual({ pairsQuantity: 1, people: [], perros: [] });
  });
});
