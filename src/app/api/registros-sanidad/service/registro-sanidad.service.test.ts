import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistrosSanidadService } from "./registro-sanidad.service";
import sequelize from "@/lib/database";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import { Perro } from "@/app/models/perro.entity";
import type { CreateRegistrosSanidadDTO } from "../dtos/create-registro-sanidad.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { PayloadForUser } from "../../perros/detalles/route";

// ---------------------- Mocks ----------------------
vi.mock("@/app/models/registro-sanidad.entity", () => ({
  RegistroSanidad: {
    create: vi.fn(),
    findAndCountAll: vi.fn(),
    findOne: vi.fn(),
  },
}));
vi.mock("@/app/models/banio.entity", () => ({
  Banio: { create: vi.fn(), findAll: vi.fn(), findByPk: vi.fn() },
}));
vi.mock("@/app/models/desparasitacion.entity", () => ({
  Desparasitacion: { create: vi.fn(), findAll: vi.fn(), findByPk: vi.fn() },
}));
vi.mock("@/app/models/vacuna.entity", () => ({
  Vacuna: { create: vi.fn(), findAll: vi.fn(), findByPk: vi.fn() },
}));
vi.mock("@/app/models/perro.entity", () => ({
  Perro: { findByPk: vi.fn(), findAll: vi.fn(), findAndCountAll: vi.fn() },
}));
vi.mock("@/app/models/expense.entity", () => ({
  Expense: { update: vi.fn() },
}));
vi.mock("../../expenses/service/expenses.service", () => ({
  ExpensesService: class {
    getFixedCost() {
      return 0;
    }
    createExpense() {
      return Promise.resolve({});
    }
  },
}));
vi.mock("@/app/api/expenses/service/expenses.service", () => ({
  ExpensesService: vi.fn().mockImplementation(() => ({
    getFixedCost: vi.fn().mockReturnValue(100),
    createExpense: vi.fn().mockResolvedValue({ id: "expense-1" }),
  })),
}));
vi.mock("@/lib/database", () => ({ default: { transaction: vi.fn() } }));
vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: vi.fn((pagination, result) => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    rows: result?.rows || [],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    count: result?.count || 0,
  })),
}));

describe("RegistrosSanidadService", () => {
  // eslint-disable-next-line init-declarations
  let service: RegistrosSanidadService;
  const adminPayload: PayloadForUser = {
    ci: "123",
    name: "test",
    type: "Administrador",
  };

  beforeEach(() => {
    service = new RegistrosSanidadService();
    vi.clearAllMocks();
  });

  // ---------------------- create ----------------------
  it("should create a banio registro", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await, require-await, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    sequelize.transaction = vi.fn().mockImplementation(async (cb) => cb({}));
    RegistroSanidad.findOne = vi.fn().mockResolvedValue(null);
    RegistroSanidad.create = vi.fn().mockResolvedValue({ id: 1 });
    Banio.create = vi.fn().mockResolvedValue({ id: 1 });
    Perro.findByPk = vi.fn().mockResolvedValue({ id: "1", duenioId: "user-1" });

    const dto: Partial<CreateRegistrosSanidadDTO> = {
      perroId: "1",
      tipoSanidad: "banio",
      fecha: "2025-09-20",
    };

    const result = await service.create(dto as CreateRegistrosSanidadDTO);
    expect(result).toEqual({ id: 1 });
  });

  it("should create a vacuna registro", async () => {
    // eslint-disable-next-line require-await, @typescript-eslint/no-unsafe-call, @typescript-eslint/require-await, @typescript-eslint/no-unsafe-return
    sequelize.transaction = vi.fn().mockImplementation(async (cb) => cb({}));
    RegistroSanidad.findOne = vi.fn().mockResolvedValue({ id: 2 });
    Vacuna.create = vi.fn().mockResolvedValue({ id: 2 });
    Perro.findByPk = vi.fn().mockResolvedValue({ id: "2", duenioId: "user-2" });

    const dto: Partial<CreateRegistrosSanidadDTO> = {
      perroId: "2",
      tipoSanidad: "vacuna",
      fecha: "2025-09-22",
      vac: "Rabia",
      carneVacunas: "CV123" as unknown as Buffer,
    };

    await service.create(dto as CreateRegistrosSanidadDTO);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Vacuna.create).toHaveBeenCalled();
  });

  it("should propagate error if create fails", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await, require-await
    sequelize.transaction = vi.fn().mockImplementation(async () => {
      throw new Error("DB error");
    });

    const dto: Partial<CreateRegistrosSanidadDTO> = {
      perroId: "3",
      tipoSanidad: "banio",
      fecha: "2025-09-24",
    };

    await expect(
      service.create(dto as CreateRegistrosSanidadDTO)
    ).rejects.toThrow("DB error");
  });

  // ---------------------- findAll ----------------------
  it("should return empty result if no registro exists", async () => {
    RegistroSanidad.findOne = vi.fn().mockResolvedValue(null);
    const pagination: Partial<PaginationDto> = {
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };
    const result = await service.findAll(
      pagination as PaginationDto,
      "123",
      adminPayload
    );
    const r = result as unknown as { rows: unknown[]; count: number };
    expect(r.rows).toEqual([]);
    expect(result.count).toBe(0);
  });

  it("should handle registro with no events at all", async () => {
    RegistroSanidad.findOne = vi.fn().mockResolvedValue({ id: 1 });
    Banio.findAll = vi.fn().mockResolvedValue([]);
    Vacuna.findAll = vi.fn().mockResolvedValue([]);
    Desparasitacion.findAll = vi.fn().mockResolvedValue([]);
    const pagination: Partial<PaginationDto> = {
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };
    const result = await service.findAll(
      pagination as PaginationDto,
      "123",
      adminPayload
    );
    const r = result as unknown as { rows: unknown[]; count: number };
    expect(r.rows).toEqual([]);
    expect(result.count).toBe(0);
  });

  it("should paginate events correctly", async () => {
    RegistroSanidad.findOne = vi.fn().mockResolvedValue({ id: 1 });

    const generateEvents = (tipo: string, startId: number, n: number) =>
      Array.from({ length: n }, (_, i) => ({
        id: startId + i,
        fecha: new Date(),
        actividad: tipo,
      }));

    Banio.findAll = vi.fn().mockResolvedValue(generateEvents("Baño", 1, 5));
    Vacuna.findAll = vi.fn().mockResolvedValue(generateEvents("Vacuna", 6, 5));
    Desparasitacion.findAll = vi
      .fn()
      .mockResolvedValue(generateEvents("Desparasitación", 11, 5));

    const pagination: Partial<PaginationDto> = {
      page: 2,
      size: 5,
      getOffset: () => 5,
      getOrder: () => [],
    };
    const result = await service.findAll(
      pagination as PaginationDto,
      "123",
      adminPayload
    );

    const r = result as unknown as { rows: unknown[]; count: number };
    expect(r.rows).toHaveLength(5);
    expect(result.count).toBe(15); // total eventos
  });

  it("should return events sorted in insertion order (Banio, Vacuna, Desparasitacion)", async () => {
    RegistroSanidad.findOne = vi.fn().mockResolvedValue({ id: 1 });

    const now = new Date();

    // Mock de los modelos: solo necesitan id y fecha
    Banio.findAll = vi.fn().mockResolvedValue([{ id: 1, fecha: now }]);
    Vacuna.findAll = vi.fn().mockResolvedValue([{ id: 2, fecha: now }]);
    Desparasitacion.findAll = vi
      .fn()
      .mockResolvedValue([{ id: 3, fecha: now }]);

    const pagination: Partial<PaginationDto> = {
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };
    const result = await service.findAll(
      pagination as PaginationDto,
      "123",
      adminPayload
    );

    // Verificamos que el servicio devuelva tres eventos
    const r1 = result as unknown as { rows: unknown[]; count: number };
    expect(r1.rows).toHaveLength(3);

    // Obtenemos el valor serializado de los objetos para inspeccionar el "activity" inferido
    const r2 = result as unknown as { rows: unknown[]; count: number };
    const tipos = r2.rows.map((item) => {
      const o = item as Record<string, unknown>;
      return o.activity ?? o.actividad;
    });
    expect(tipos).toEqual(["Baño", "Vacuna", "Desparasitación"]);
  });

  it("should handle pagination size 0", async () => {
    RegistroSanidad.findOne = vi.fn().mockResolvedValue({ id: 1 });

    Banio.findAll = vi
      .fn()
      .mockResolvedValue([{ id: 1, actividad: "Baño", fecha: new Date() }]);
    Vacuna.findAll = vi.fn().mockResolvedValue([]);
    Desparasitacion.findAll = vi.fn().mockResolvedValue([]);

    const pagination: Partial<PaginationDto> = {
      page: 1,
      size: 0,
      getOffset: () => 0,
      getOrder: () => [],
    };
    const result = await service.findAll(
      pagination as PaginationDto,
      "123",
      adminPayload
    );

    const r = result as unknown as { rows: unknown[]; count: number };
    expect(r.rows).toEqual([]);
    expect(result.count).toBe(1); // total eventos aunque size=0
  });

  // ---------------------- updateEventoSanidad ----------------------
  it("should update a vacuna when given ArrayBuffer carneVacunas and vac", async () => {
    // Reset transaction mock for this test
    // eslint-disable-next-line @typescript-eslint/require-await, require-await, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    sequelize.transaction = vi.fn().mockImplementation(async (cb) => cb({}));

    // prepare a small ArrayBuffer
    const arr = new Uint8Array([1, 2, 3, 4]);

    const updateSpy = vi.fn().mockResolvedValue(true);
    Vacuna.findByPk = vi
      .fn()
      .mockResolvedValue({ id: "v1", update: updateSpy });

    const res = await service.updateEventoSanidad("vacuna", "v1", {
      carneVacunas: arr.buffer,
      vac: "Rabia",
    });

    // findByPk was mocked; main assertion is that update was invoked
    // vaccine entity should be returned
    expect(res).not.toBeNull();
    // update should have been called
    expect(updateSpy).toHaveBeenCalled();
    const calledWithRaw: unknown = updateSpy.mock.calls[0][0];
    expect(typeof calledWithRaw === "object" && calledWithRaw !== null).toBe(
      true
    );
    const calledWith = calledWithRaw as Record<string, unknown>;
    expect(calledWith.vac).toBe("Rabia");
    // carneVacunas should have been converted to Buffer
    expect(Buffer.isBuffer(calledWith.carneVacunas)).toBe(true);
  });

  it("should update a banio with fecha parsed to Date", async () => {
    // Reset transaction mock for this test
    // eslint-disable-next-line @typescript-eslint/require-await, require-await, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    sequelize.transaction = vi.fn().mockImplementation(async (cb) => cb({}));

    const updateSpy = vi.fn().mockResolvedValue(true);
    Banio.findByPk = vi.fn().mockResolvedValue({ id: "b1", update: updateSpy });

    const res = await service.updateEventoSanidad("banio", "b1", {
      fecha: "2025-10-01",
    });

    // findByPk was mocked; main assertion is that update was invoked
    expect(res).not.toBeNull();
    expect(updateSpy).toHaveBeenCalled();
    const calledWithRaw: unknown = updateSpy.mock.calls[0][0];
    expect(typeof calledWithRaw === "object" && calledWithRaw !== null).toBe(
      true
    );
    const calledWith = calledWithRaw as Record<string, unknown>;
    expect(calledWith.fecha).toBeInstanceOf(Date);
  });

  it("should update desparasitacion with medicamento and tipoDesparasitacion", async () => {
    // Reset transaction mock for this test
    // eslint-disable-next-line @typescript-eslint/require-await, require-await, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    sequelize.transaction = vi.fn().mockImplementation(async (cb) => cb({}));

    const updateSpy = vi.fn().mockResolvedValue(true);
    Desparasitacion.findByPk = vi
      .fn()
      .mockResolvedValue({ id: "d1", update: updateSpy });

    const res = await service.updateEventoSanidad("desparasitacion", "d1", {
      medicamento: "Ivermectina",
      tipoDesparasitacion: "Interna",
      fecha: "2025-09-30",
    });

    // findByPk was mocked; main assertion is that update was invoked
    expect(res).not.toBeNull();
    expect(updateSpy).toHaveBeenCalled();
    const calledWithRaw: unknown = updateSpy.mock.calls[0][0];
    expect(typeof calledWithRaw === "object" && calledWithRaw !== null).toBe(
      true
    );
    const calledWith = calledWithRaw as Record<string, unknown>;
    expect(calledWith.medicamento).toBe("Ivermectina");
    expect(calledWith.tipoDesparasitacion).toBe("Interna");
    expect(calledWith.fecha).toBeInstanceOf(Date);
  });

  it("should return null when vacuna not found", async () => {
    // Reset transaction mock for this test
    // eslint-disable-next-line @typescript-eslint/require-await, require-await, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    sequelize.transaction = vi.fn().mockImplementation(async (cb) => cb({}));

    Vacuna.findByPk = vi.fn().mockResolvedValue(null);
    const res = await service.updateEventoSanidad("vacuna", "missing", {});
    expect(res).toBeNull();
  });
});
