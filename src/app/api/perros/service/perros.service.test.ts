import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { PerrosService } from "./perros.service";
import { Perro as PerroModel } from "@/app/models/perro.entity";
import { Op } from "sequelize";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { Perro } from "@/app/models/perro.entity";
import type { UsrPerro } from "@/app/models/usrperro.entity";

// Tipos auxiliares para mocks y resultados
type SequelizeFindAndCountAll<T> = {
  count: number;
  rows: { get: () => T }[];
};

type PerroWithIntervencion = Perro & {
  intervencionCount?: number;
  UsrPerros?: DeepPartial<UsrPerro>[];
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Mock de entidades
vi.mock("@/app/models/perro.entity", () => ({
  Perro: { findAndCountAll: vi.fn() },
}));
vi.mock("@/app/models/user.entity", () => ({ User: {} }));
vi.mock("@/app/models/usrperro.entity", () => ({ UsrPerro: {} }));
vi.mock("@/app/models/intervencion.entity", () => ({ Intervencion: {} }));
vi.mock("@/app/models/registro-sanidad.entity", () => ({
  RegistroSanidad: {},
}));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: {} }));

// Mock de transform
vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: (
    pagination: PaginationDto,
    processed: { rows: Perro[]; count: number }
  ): PaginationResultDto<Perro> => ({
    data: processed.rows,
    count: processed.count,
    totalItems: processed.count,
    totalPages: Math.ceil(processed.count / pagination.size),
    page: pagination.page,
    size: pagination.size,
  }),
}));

describe("PerrosService", () => {
  // eslint-disable-next-line init-declarations
  let service: PerrosService;
  // eslint-disable-next-line init-declarations
  let mockFindAndCountAll: Mock;

  beforeEach(() => {
    service = new PerrosService();
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    mockFindAndCountAll = vi.mocked(PerroModel.findAndCountAll);
  });

  it("findAll should return paginated perros", async () => {
    mockFindAndCountAll.mockResolvedValue({
      count: 1,
      rows: [
        {
          get: () =>
            ({
              id: "1",
              nombre: "Firulais",
            }) as Partial<Perro> as Perro,
        },
      ],
    } satisfies SequelizeFindAndCountAll<Perro>);

    const pagination: PaginationDto = {
      query: "",
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);
    const firulais = result.data[0];

    expect(firulais.nombre).toBe("Firulais");
    expect(result.totalItems).toBe(1);
  });

  it("findAll should handle empty results", async () => {
    mockFindAndCountAll.mockResolvedValue({
      count: 0,
      rows: [],
    } satisfies SequelizeFindAndCountAll<Perro>);

    const pagination: PaginationDto = {
      query: "",
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    expect(result.data).toHaveLength(0);
    expect(result.totalItems).toBe(0);
  });

  it("findAll should filter by query", async () => {
    mockFindAndCountAll.mockImplementation((args: { where?: unknown }) => {
      const where = args.where as
        | Record<string, Record<symbol, string>>
        | undefined;
      if (where?.nombre?.[Op.iLike] === "%Firulais%") {
        return {
          count: 1,
          rows: [
            {
              get: () =>
                ({
                  id: "1",
                  nombre: "Firulais",
                }) as Partial<Perro> as Perro,
            },
          ],
        } satisfies SequelizeFindAndCountAll<Perro>;
      }
      return { count: 0, rows: [] } satisfies SequelizeFindAndCountAll<Perro>;
    });

    const pagination: PaginationDto = {
      query: "Firulais",
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    expect(result.data[0].nombre).toBe("Firulais");
    expect(result.totalItems).toBe(1);
  });

  it("findAll handles offset beyond total rows", async () => {
    mockFindAndCountAll.mockResolvedValue({
      count: 2,
      rows: [],
    } satisfies SequelizeFindAndCountAll<Perro>);

    const pagination: PaginationDto = {
      query: "",
      page: 10,
      size: 10,
      getOffset: () => 100,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    expect(result.data).toHaveLength(0);
    expect(result.totalItems).toBe(2);
  });

  it("findAll passes order correctly", async () => {
    const mockFn = vi.fn().mockResolvedValue({
      count: 1,
      rows: [
        {
          get: () =>
            ({
              id: "1",
              nombre: "Firulais",
            }) as Partial<Perro> as Perro,
        },
      ],
    } satisfies SequelizeFindAndCountAll<Perro>);
    (PerroModel.findAndCountAll as unknown) = mockFn;

    const pagination: PaginationDto = {
      query: "",
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [["nombre", "ASC"]],
    };

    await service.findAll(pagination);

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({ order: [["nombre", "ASC"]] })
    );
  });

  it("findAll handles multiple rows", async () => {
    mockFindAndCountAll.mockResolvedValue({
      count: 2,
      rows: [
        {
          get: () =>
            ({
              id: "1",
              nombre: "Firulais",
            }) as Partial<Perro> as Perro,
        },
        {
          get: () =>
            ({
              id: "2",
              nombre: "Bobby",
            }) as Partial<Perro> as Perro,
        },
      ],
    } satisfies SequelizeFindAndCountAll<Perro>);

    const pagination: PaginationDto = {
      query: "",
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    expect(result.data).toHaveLength(2);
    expect(result.data.map((p) => p.nombre)).toEqual(["Firulais", "Bobby"]);
  });

  it("findAll should propagate DB errors", async () => {
    mockFindAndCountAll.mockRejectedValue(new Error("DB error"));

    const pagination: PaginationDto = {
      query: "",
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

    await expect(service.findAll(pagination)).rejects.toThrow("DB error");
  });

  it("findAll should handle undefined query without where", async () => {
    const mockFn = vi.fn().mockResolvedValue({
      count: 0,
      rows: [],
    } as SequelizeFindAndCountAll<Perro>);
    (PerroModel.findAndCountAll as unknown) = mockFn;

    const pagination: PaginationDto = {
      query: undefined,
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

    await service.findAll(pagination);

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined })
    );
  });

  it("findAll should pass limit = 0 if pagination size is 0", async () => {
    const mockFn = vi.fn().mockResolvedValue({
      count: 0,
      rows: [],
    } as SequelizeFindAndCountAll<Perro>);
    (PerroModel.findAndCountAll as unknown) = mockFn;

    const pagination: PaginationDto = {
      query: "",
      page: 1,
      size: 0,
      getOffset: () => 0,
      getOrder: () => [],
    };

    await service.findAll(pagination);

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ limit: 0 }));
  });

  it("findAll should calculate intervencionCount from UsrPerros", async () => {
    mockFindAndCountAll.mockResolvedValue({
      count: 1,
      rows: [
        {
          get: () =>
            ({
              id: "1",
              nombre: "Firulais",
              UsrPerros: [{ id: 10 }, { id: 20 }],
            }) as unknown as PerroWithIntervencion,
        },
      ],
    } satisfies SequelizeFindAndCountAll<PerroWithIntervencion>);

    const pagination: PaginationDto = {
      query: "",
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    const firulais = result.data[0] as PerroWithIntervencion;

    expect(firulais.intervencionCount).toBe(2);
    expect(firulais.UsrPerros).toBeUndefined();
  });
});
