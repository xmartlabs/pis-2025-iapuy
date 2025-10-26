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
  Banio: { create: vi.fn(), findAll: vi.fn() },
}));
vi.mock("@/app/models/desparasitacion.entity", () => ({
  Desparasitacion: { create: vi.fn(), findAll: vi.fn() },
}));
vi.mock("@/app/models/vacuna.entity", () => ({
  Vacuna: { create: vi.fn(), findAll: vi.fn() },
}));
vi.mock("@/app/models/perro.entity", () => ({
  Perro: { findByPk: vi.fn() },
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(result.rows).toEqual([]);
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(result.rows).toEqual([]);
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

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(result.rows).toHaveLength(5);
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(result.rows).toHaveLength(3);

    // Obtenemos el valor serializado de los objetos para inspeccionar el "activity" inferido
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    const serialized = (result.rows as unknown as any[]).map((r: any) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      JSON.parse(JSON.stringify(r))
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const tipos = serialized.map((r: { activity: any }) => r.activity);
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

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(result.rows).toEqual([]);
    expect(result.count).toBe(1); // total eventos aunque size=0
  });
});
