/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, it, expect, vi } from "vitest";
import { InscripcionController } from "./inscription.controller";

class MockInscripcionService {
  inscribirse = vi.fn();
}

const makeRequest = (body: any) => ({
  json: vi.fn().mockResolvedValue(body),
}) as any;

describe("InscripcionController.postInscripcion", () => {
  it("should throw error when 'tipo' is missing", async () => {
    const controller = new InscripcionController(new MockInscripcionService() as any);
    const req = makeRequest({ ci: "1", intervencion: "INT-1" });

    await expect(controller.postInscripcion(req))
      .rejects.toThrow("Tipo de inscripción requerida");
  });

  it("should throw error when 'ci' is missing", async () => {
    const controller = new InscripcionController(new MockInscripcionService() as any);
    const req = makeRequest({ tipo: "guia", intervencion: "INT-1", perro: "DOG-1" });

    await expect(controller.postInscripcion(req))
      .rejects.toThrow("Cédula del colaborador requerida");
  });

  it("should throw error when 'intervencion' is missing", async () => {
    const controller = new InscripcionController(new MockInscripcionService() as any);
    const req = makeRequest({ tipo: "guia", ci: "1", perro: "DOG-1" });

    await expect(controller.postInscripcion(req))
      .rejects.toThrow("Id de intervención requerida");
  });

  it("should throw error when 'perro' is missing for guide type", async () => {
    const controller = new InscripcionController(new MockInscripcionService() as any);
    const req = makeRequest({ tipo: "guia", ci: "1", intervencion: "INT-1" });

    await expect(controller.postInscripcion(req))
      .rejects.toThrow("Para inscribirse como guía se requiere perro");
  });

  it("should call service when request is valid", async () => {
    const service = new MockInscripcionService();
    const controller = new InscripcionController(service as any);
    const payload = { tipo: "acompaniante", ci: "1", intervencion: "INT-1" };
    const req = makeRequest(payload);

    service.inscribirse.mockResolvedValue({ ok: true });

    const res = await controller.postInscripcion(req);
    expect(service.inscribirse).toHaveBeenCalledWith(payload);
    expect(res).toEqual({ ok: true });
  });

  it("should propagate service error message", async () => {
    const service = new MockInscripcionService();
    const controller = new InscripcionController(service as any);
    const payload = { tipo: "acompaniante", ci: "1", intervencion: "INT-1" };
    const req = makeRequest(payload);

    service.inscribirse.mockRejectedValue(new Error("internal message"));

    await expect(controller.postInscripcion(req)).rejects.toThrow("internal message");
  });
});
