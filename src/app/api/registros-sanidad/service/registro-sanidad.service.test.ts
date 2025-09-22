import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistrosSanidadService } from "./registro-sanidad.service";
import sequelize from "@/lib/database";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { Perro } from "@/app/models/perro.entity";
import { User } from "@/app/models/user.entity";



vi.mock("@/app/models/registro-sanidad.entity", () => ({ RegistroSanidad: { create: vi.fn(), findAndCountAll: vi.fn() } }));
vi.mock("@/app/models/perro.entity", () => ({ Perro: {} }));
vi.mock("@/app/models/user.entity", () => ({ User: {} }));
vi.mock("@/app/models/banio.entity", () => ({ Banio: { create: vi.fn() } }));
vi.mock("@/app/models/desparasitacion.entity", () => ({ Desparasitacion: { create: vi.fn() } }));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: { create: vi.fn() } }));
vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: (_pagination: any, processed: any) => ({
    data: processed.rows,
    count: processed.count,
  }),
}));
vi.mock("@/lib/database", () => ({
  default: { transaction: vi.fn() },
}));

describe("RegistrosSanidadService", () => {
  let service: RegistrosSanidadService;

  beforeEach(() => {
    service = new RegistrosSanidadService();
    vi.clearAllMocks();
  });

  // --- Tests create ---
  it("should create a banio registro", async () => {
    const mockTransaction = vi.fn().mockImplementation((cb) => cb("transaction"));
    (sequelize.transaction as any).mockImplementation(mockTransaction);


    (RegistroSanidad.create as any).mockResolvedValue({ id: 1 });

    const dto = { perroId: 1, tipoSanidad: "banio", fecha: "20-09-2025" };
    await service.create(dto as any);

    expect(sequelize.transaction).toHaveBeenCalled();
    expect(RegistroSanidad.create).toHaveBeenCalledWith(
      { perroId: 1 },
      { transaction: "transaction" }
    );
    expect(Banio.create).toHaveBeenCalledWith(
      { fecha: new Date("20-09-2025"), registroSanidadId: 1 },
      { transaction: "transaction" }
    );
  });

  it("should create a desparasitacion registro", async () => {
    const mockTransaction = vi.fn().mockImplementation((cb) => cb("transaction"));
    (sequelize.transaction as any).mockImplementation(mockTransaction);

    (RegistroSanidad.create as any).mockResolvedValue({ id: 2 });

    const dto = {
      perroId: 2,
      tipoSanidad: "desparasitacion",
      fecha: "21-09-2025",
      medicamento: "med1",
      tipoDesparasitacion: "oral",
    };

    await service.create(dto as any);

    expect(Desparasitacion.create).toHaveBeenCalledWith(
      {
        fecha: new Date("21-09-2025"),
        medicamento: "med1",
        registroSanidadId: 2,
        tipoDesparasitacion: "oral",
      },
      { transaction: "transaction" }
    );
  });

  it("should create a vacuna registro", async () => {
    const mockTransaction = vi.fn().mockImplementation((cb) => cb("transaction"));
    (sequelize.transaction as any).mockImplementation(mockTransaction);


    (RegistroSanidad.create as any).mockResolvedValue({ id: 3 });

    const dto = {
      perroId: 3,
      tipoSanidad: "vacuna",
      fecha: "22-09-2025",
      vac: "Rabia",
      carneVacunas: "CV123",
    };

    await service.create(dto as any);

    expect(Vacuna.create).toHaveBeenCalledWith(
      {
        fecha: new Date("22-09-2025"),
        vac: "Rabia",
        registroSanidadId: 3,
        carneVacunas: "CV123",
      },
      { transaction: "transaction" }
    );
  });

  it("should return the created registroSanidad", async () => {
    const mockTransaction = vi.fn().mockImplementation((cb) => cb("transaction"));
    (sequelize.transaction as any).mockImplementation(mockTransaction);

    const { RegistroSanidad } = await import("@/app/models/registro-sanidad.entity");

    const createdRegistro = { id: 5 };
    (RegistroSanidad.create as any).mockResolvedValue(createdRegistro);

    const dto = { perroId: 5, tipoSanidad: "banio", fecha: "23-09-2025" };

    const result = await service.create(dto as any);

    expect(result).toBe(createdRegistro);
  });

  it("should propagate error if create fails", async () => {
    const mockTransaction = vi.fn().mockImplementation((cb) => cb("transaction"));
    (sequelize.transaction as any).mockImplementation(mockTransaction);

    const { RegistroSanidad } = await import("@/app/models/registro-sanidad.entity");

    (RegistroSanidad.create as any).mockRejectedValue(new Error("DB error"));

    const dto = { perroId: 6, tipoSanidad: "banio", fecha: "24-09-2025" };

    await expect(service.create(dto as any)).rejects.toThrow("DB error");
  });

  // --- Tests findAll ---
  it("findAll should return paginated registros", async () => {
    const { RegistroSanidad } = await import("@/app/models/registro-sanidad.entity");

    (RegistroSanidad.findAndCountAll as any).mockResolvedValue({
      count: 2,
      rows: [{ id: 1 }, { id: 2 }],
    });

    const pagination = { size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await service.findAll(pagination as any);

    expect(result.data).toHaveLength(2);
    expect(result.count).toBe(2);
  });
});
