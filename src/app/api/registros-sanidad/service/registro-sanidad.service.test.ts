
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistrosSanidadService } from "./registro-sanidad.service";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Banio } from "@/app/models/banio.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { getPaginationResultFromModel } from "@/lib/pagination/transform";
import { EventoSanidadDto } from "../dtos/evento-sanidad.dto";


vi.mock("@/app/models/registro-sanidad.entity", () => ({ RegistroSanidad: { findOne: vi.fn() } }));
vi.mock("@/app/models/banio.entity", () => ({ Banio: { findAll: vi.fn() } }));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: { findAll: vi.fn() } }));
vi.mock("@/app/models/desparasitacion.entity", () => ({ Desparasitacion: { findAll: vi.fn() } }));
vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: vi.fn((_, processed) => ({
    data: processed.rows ?? [],
    count: processed.count ?? 0,
  })),
}));

describe("RegistrosSanidadService", () => {
  let service: RegistrosSanidadService;

  beforeEach(() => {
    service = new RegistrosSanidadService();
    vi.clearAllMocks();
  });

  it("should return empty result if no registro exists", async () => {
    (RegistroSanidad.findOne as any).mockResolvedValue(null);

    const pagination = { page: 1, size: 10 };
    const result = await service.findAll(pagination as any, "123");

    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
    expect(RegistroSanidad.findOne).toHaveBeenCalledWith({ where: { perroId: "123" } });
  });

  it("should return combined events when registro exists", async () => {
    const registro = { id: 1 };
    (RegistroSanidad.findOne as any).mockResolvedValue(registro);
    (Banio.findAll as any).mockResolvedValue([{ id: 10, fecha: new Date("2025-01-01") }]);
    (Vacuna.findAll as any).mockResolvedValue([{ id: 20, fecha: new Date("2025-02-01") }]);
    (Desparasitacion.findAll as any).mockResolvedValue([{ id: 30, fecha: new Date("2025-03-01") }]);

    const pagination = { page: 1, size: 10 };
    const result = await service.findAll(pagination as any, "123");

    expect(result.count).toBe(3);
    expect(result.data).toHaveLength(3);

    const tipos = result.data.map((r: EventoSanidadDto) => r.actividad);
    expect(tipos).toEqual(expect.arrayContaining(["Baño", "Vacuna", "Desparasitación"]));
  });

  it("should paginate events correctly", async () => {
    const registro = { id: 1 };
    (RegistroSanidad.findOne as any).mockResolvedValue(registro);

   
    const generateEvents = (prefix: string) =>
      Array.from({ length: 5 }, (_, i) => ({ id: i, fecha: new Date() }));

    (Banio.findAll as any).mockResolvedValue(generateEvents("b"));
    (Vacuna.findAll as any).mockResolvedValue(generateEvents("v"));
    (Desparasitacion.findAll as any).mockResolvedValue(generateEvents("d"));

    const pagination = { page: 2, size: 5 }; 
    const result = await service.findAll(pagination as any, "123");

    expect(result.data).toHaveLength(5);
    expect(result.count).toBe(15); 
  });

  it("should handle errors and return empty result", async () => {
    (RegistroSanidad.findOne as any).mockRejectedValue(new Error("DB error"));

    const pagination = { page: 1, size: 10 };
    const result = await service.findAll(pagination as any, "123");

    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });

  it("should format dates as dd/mm/yyyy", async () => {
    const registro = { id: 1 };
    (RegistroSanidad.findOne as any).mockResolvedValue(registro);
    (Banio.findAll as any).mockResolvedValue([
  { id: 1, fecha: new Date("2025-09-19T12:00:00") }, 
]);

    (Vacuna.findAll as any).mockResolvedValue([]);
    (Desparasitacion.findAll as any).mockResolvedValue([]);

    const pagination = { page: 1, size: 10 };
    const result = await service.findAll(pagination as any, "123");

    expect(result.data[0].fecha).toBe("19/09/2025");
  });

  it("should handle registro with no events at all", async () => {
  const registro = { id: 1 };
  (RegistroSanidad.findOne as any).mockResolvedValue(registro);
  (Banio.findAll as any).mockResolvedValue([]);
  (Vacuna.findAll as any).mockResolvedValue([]);
  (Desparasitacion.findAll as any).mockResolvedValue([]);

  const pagination = { page: 1, size: 10 };
  const result = await service.findAll(pagination as any, "123");

  expect(result.data).toEqual([]);
  expect(result.count).toBe(0);
});


it("should slice correctly when pagination page is beyond total events", async () => {
  const registro = { id: 1 };
  (RegistroSanidad.findOne as any).mockResolvedValue(registro);

  const events = Array.from({ length: 3 }, (_, i) => ({ id: i + 1, fecha: new Date("2025-09-19") }));
  (Banio.findAll as any).mockResolvedValue(events);
  (Vacuna.findAll as any).mockResolvedValue([]);
  (Desparasitacion.findAll as any).mockResolvedValue([]);

  const pagination = { page: 2, size: 5 }; 
  const result = await service.findAll(pagination as any, "123");

  expect(result.data).toEqual([]); 
  expect(result.count).toBe(3);
});

it("should return events sorted in insertion order (Banio, Vacuna, Desparasitacion)", async () => {
  const registro = { id: 1 };
  (RegistroSanidad.findOne as any).mockResolvedValue(registro);

  (Banio.findAll as any).mockResolvedValue([{ id: 1, fecha: new Date("2025-01-01") }]);
  (Vacuna.findAll as any).mockResolvedValue([{ id: 2, fecha: new Date("2025-02-01") }]);
  (Desparasitacion.findAll as any).mockResolvedValue([{ id: 3, fecha: new Date("2025-03-01") }]);

  const pagination = { page: 1, size: 10 };
  const result = await service.findAll(pagination as any, "123");

  const actividades = result.data.map(r => r.actividad);
  expect(actividades).toEqual(["Baño", "Vacuna", "Desparasitación"]);
});
it("should handle pagination size 0", async () => {
  const registro = { id: 1 };
  (RegistroSanidad.findOne as any).mockResolvedValue(registro);

  (Banio.findAll as any).mockResolvedValue([{ id: 1, fecha: new Date("2025-09-19") }]);
  (Vacuna.findAll as any).mockResolvedValue([]);
  (Desparasitacion.findAll as any).mockResolvedValue([]);

  const pagination = { page: 1, size: 0 }; 
  const result = await service.findAll(pagination as any, "123");

  expect(result.data).toEqual([]); 
  expect(result.count).toBe(1); 
});

it("should handle events with duplicated IDs", async () => {
  const registro = { id: 1 };
  (RegistroSanidad.findOne as any).mockResolvedValue(registro);

  const duplicateEvents = [
    { id: 1, fecha: new Date("2025-01-01") },
    { id: 1, fecha: new Date("2025-02-01") },
  ];

  (Banio.findAll as any).mockResolvedValue(duplicateEvents);
  (Vacuna.findAll as any).mockResolvedValue([]);
  (Desparasitacion.findAll as any).mockResolvedValue([]);

  const pagination = { page: 1, size: 10 };
  const result = await service.findAll(pagination as any, "123");

 
  expect(result.data).toHaveLength(2);
  expect(result.data.map(r => r.id)).toEqual([1, 1]);
  expect(result.count).toBe(2);
});

});
