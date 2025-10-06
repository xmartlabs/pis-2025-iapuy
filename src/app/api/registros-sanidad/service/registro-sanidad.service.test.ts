import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistrosSanidadService } from "./registro-sanidad.service";
import sequelize from "@/lib/database";
import { RegistroSanidad } from "@/app/models/registro-sanidad.entity";
import { Banio } from "@/app/models/banio.entity";
import { Desparasitacion } from "@/app/models/desparasitacion.entity";
import { Vacuna } from "@/app/models/vacuna.entity";
import type { CreateRegistrosSanidadDTO } from "../dtos/create-registro-sanidad.dto";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { PayloadForUser } from "../../perros/detalles/route";

vi.mock("@/app/models/registro-sanidad.entity", () => ({
  RegistroSanidad: { create: vi.fn(), findAndCountAll: vi.fn(), findOne: vi.fn() },
}));
vi.mock("@/app/models/perro.entity", () => ({ Perro: {} }));
vi.mock("@/app/models/user.entity", () => ({ User: {} }));
vi.mock("@/app/models/banio.entity", () => ({ Banio: { create: vi.fn(), findAll: vi.fn() } }));
vi.mock("@/app/models/desparasitacion.entity", () => ({ Desparasitacion: { create: vi.fn(), findAll: vi.fn() } }));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: { create: vi.fn(), findAll: vi.fn() } }));
vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: (_pagination: unknown, processed: unknown) => {
    const p = processed as { rows: unknown[]; count: number };
    return { data: p.rows, count: p.count };
  },
}));
vi.mock("@/lib/database", () => ({ default: { transaction: vi.fn() } }));

describe("RegistrosSanidadService", () => {
  // eslint-disable-next-line init-declarations
  let service: RegistrosSanidadService;
  const adminPayload: PayloadForUser = { ci: "123", name: "test", type: "Administrador" } as PayloadForUser;

  beforeEach(() => {
    service = new RegistrosSanidadService();
    vi.clearAllMocks();
  });

  it("should create a banio registro", async () => {

  const transactionMock = vi
    .fn()
    .mockImplementation(async (cb: (t: string) => Promise<unknown>) => await cb("transaction"));
  sequelize.transaction = transactionMock;

  const registroCreateMock = vi.fn().mockResolvedValue({ id: "1" }) as unknown as typeof RegistroSanidad.create;
  RegistroSanidad.create = registroCreateMock;

  const banioCreateMock = vi.fn().mockResolvedValue({ id: "1" }) as unknown as typeof Banio.create;
  Banio.create = banioCreateMock;

  const dto: Partial<CreateRegistrosSanidadDTO> = {
    perroId:  1 as unknown as string,
    tipoSanidad: "banio",
    fecha: "20-09-2025",
  };


  await service.create(dto as CreateRegistrosSanidadDTO);


  expect(transactionMock).toHaveBeenCalled();
  expect(registroCreateMock).toHaveBeenCalledWith(
    { perroId: 1 },
    { transaction: "transaction" }
  );
  expect(banioCreateMock).toHaveBeenCalledWith(
    { fecha: new Date("20-09-2025"), registroSanidadId: "1" },
    { transaction: "transaction" }
  );
});


  it("should create a banio registro", async () => {
  const transactionMock = vi.fn().mockImplementation(async (cb: (t: string) => Promise<unknown>) => await cb("transaction"));
    sequelize.transaction = transactionMock;

    const registroCreateMock = vi.fn().mockResolvedValue({ id: 2 }) as unknown as typeof RegistroSanidad.create;
    RegistroSanidad.create = registroCreateMock;

    const banioCreateMock = vi.fn().mockResolvedValue({ id: 2 }) as unknown as typeof Banio.create;
    Banio.create = banioCreateMock;

    
    const dto: Partial<CreateRegistrosSanidadDTO> = {
      perroId: 2 as unknown as string,
      tipoSanidad: "banio",
      fecha: "20-09-2025",
    };

  await service.create(dto as CreateRegistrosSanidadDTO);

    expect(transactionMock).toHaveBeenCalled();
    expect(registroCreateMock).toHaveBeenCalledWith(
      { perroId: 2},
      { transaction: "transaction" }
    );
    expect(banioCreateMock).toHaveBeenCalledWith(
      { fecha: new Date("20-09-2025"), registroSanidadId: 2 },
      { transaction: "transaction" }
    );
  });


  it("should create a vacuna registro", async () => {
  const transactionMock = vi.fn().mockImplementation(async (cb: (t: string) => Promise<unknown>) => await cb("transaction"));
    sequelize.transaction = transactionMock;

    const registroCreateMock = vi.fn().mockResolvedValue({ id: 3 }) as unknown as typeof RegistroSanidad.create;
    RegistroSanidad.create = registroCreateMock;

    const vacunaCreateMock = vi.fn().mockResolvedValue({ id: 3 }) as unknown as typeof Vacuna.create;
    Vacuna.create = vacunaCreateMock;

    const dto: Partial<CreateRegistrosSanidadDTO> ={
      perroId: 3 as unknown as string,
      tipoSanidad: "vacuna",
      fecha: "22-09-2025",
      vac: "Rabia",
      carneVacunas: "CV123" as unknown as Buffer<ArrayBufferLike>,
    };

  await service.create(dto as CreateRegistrosSanidadDTO);

    expect(transactionMock).toHaveBeenCalled();
    expect(registroCreateMock).toHaveBeenCalledWith(
      { perroId: 3},
      { transaction: "transaction" }
    );
    expect(vacunaCreateMock).toHaveBeenCalledWith(
    {
      fecha: new Date("22-09-2025"),
      vac: "Rabia",
      carneVacunas: "CV123",
      registroSanidadId: 3,
    },
    { transaction: "transaction" }
  );

  });

  it("should return the created registroSanidad", async () => {
  const transactionMock = vi.fn().mockImplementation(async (cb: (t: string) => Promise<unknown>) => await cb("transaction"));
    sequelize.transaction = transactionMock;

    const registroCreateMock = vi.fn().mockResolvedValue({ id: 5 }) as unknown as typeof RegistroSanidad.create;
    RegistroSanidad.create = registroCreateMock;
    

    const dto: Partial<CreateRegistrosSanidadDTO>  = { perroId: 5 as unknown as string, tipoSanidad: "banio", fecha: "23-09-2025" };

  const result = await service.create(dto as CreateRegistrosSanidadDTO);

    expect(result).toEqual({ id: 5 });

  });

  it("should propagate error if create fails", async () => {
    const transactionMock = vi.fn().mockImplementation(async (cb: (t: string) => Promise<unknown>) => await cb("transaction"));
    sequelize.transaction = transactionMock;

    RegistroSanidad.create = vi.fn().mockRejectedValue(new Error("DB error")) as typeof RegistroSanidad.create;

    const dto: Partial<CreateRegistrosSanidadDTO> = {
      perroId: "6",
      tipoSanidad: "banio",
      fecha: "24-09-2025",
    };

  await expect(service.create(dto as CreateRegistrosSanidadDTO)).rejects.toThrow("DB error");
  });


  // --- Tests findAll ---

  it("should return empty result if no registro exists", async () => {
    const findOneMock = vi.fn().mockResolvedValue(null);
    RegistroSanidad.findOne = findOneMock;

    const pagination: Partial<PaginationDto> = {
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

  const result = await service.findAll(pagination as PaginationDto, "123", adminPayload);
    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
    expect(findOneMock).toHaveBeenCalledWith({ where: { perroId: "123" } });
  });


it("should return combined events when registro exists", async () => {
  const findOneMock = vi.fn().mockResolvedValue({ id: 1 });
  RegistroSanidad.findOne = findOneMock;

  const banioMock = vi.fn().mockResolvedValue([{ id: 10, fecha: new Date("2025-01-01") }]);
  Banio.findAll = banioMock;

  const vacunaMock = vi.fn().mockResolvedValue([{ id: 20, fecha: new Date("2025-02-01") }]);
  Vacuna.findAll = vacunaMock;

  const desparasitacionMock = vi.fn().mockResolvedValue([{ id: 30, fecha: new Date("2025-03-01") }]);
  Desparasitacion.findAll = desparasitacionMock;


  const pagination: Partial<PaginationDto> = {
    page: 1,
    size: 10,
    getOffset: () => 0,
    getOrder: () => [],
  };


  const result = await service.findAll(pagination as PaginationDto, "123", adminPayload);


  expect(result.count).toBe(3);
  expect(result.data).toHaveLength(3);

  const tipos = result.data.map(r => r.actividad);
  expect(tipos).toEqual(expect.arrayContaining(["Baño", "Vacuna", "Desparasitación"]));


  expect(findOneMock).toHaveBeenCalledWith({ where: { perroId: "123" } });
  expect(banioMock).toHaveBeenCalledWith({ where: { registroSanidadId: 1 } });
  expect(vacunaMock).toHaveBeenCalledWith({ where: { registroSanidadId: 1 } });
  expect(desparasitacionMock).toHaveBeenCalledWith({ where: { registroSanidadId: 1 } });
});


  it("should paginate events correctly", async () => {
    const registro = { id: 1 };
    RegistroSanidad.findOne = vi.fn().mockResolvedValue(registro);

   
    const generateEvents = () =>
      Array.from({ length: 5 }, (_, i) => ({ id: i, fecha: new Date() }));

    Banio.findAll = vi.fn().mockResolvedValue(generateEvents());
    Vacuna.findAll = vi.fn().mockResolvedValue(generateEvents());
    Desparasitacion.findAll = vi.fn().mockResolvedValue(generateEvents());
    const pagination: Partial<PaginationDto> = {
      page: 2,
      size: 5,
      getOffset: () => 5,
      getOrder: () => [],
    };
  const result = await service.findAll(pagination as PaginationDto, "123", adminPayload);

    expect(result.data).toHaveLength(5); 
    expect(result.count).toBe(15);       
  });

  it("should handle errors and return empty result", async () => {
    RegistroSanidad.findOne = vi.fn().mockRejectedValue(new Error("DB error"));

    const pagination: Partial<PaginationDto> = {
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

  const result = await service.findAll(pagination as PaginationDto, "123", adminPayload);

    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });


  it("should format dates as dd/mm/yyyy", async () => {
    RegistroSanidad.findOne = vi.fn().mockResolvedValue({ id: 1 });
    Banio.findAll = vi.fn().mockResolvedValue([{ id: 1, fecha: new Date("2025-09-19T12:00:00") }]);
    Vacuna.findAll = vi.fn().mockResolvedValue([]);
    Desparasitacion.findAll = vi.fn().mockResolvedValue([]);

    const pagination: Partial<PaginationDto> = {
      page: 1,
      size: 10,
      getOffset: () => 0,
      getOrder: () => [],
    };

  const result = await service.findAll(pagination as PaginationDto, "123", adminPayload);

    expect(result.data[0].fecha).toBe("19/09/2025");
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

  const result = await service.findAll(pagination as PaginationDto, "123", adminPayload);

    expect(result.data).toEqual([]);
    expect(result.count).toBe(0);
  });



it("should slice correctly when pagination page is beyond total events", async () => {
  RegistroSanidad.findOne = vi.fn().mockResolvedValue({ id: 1 });

  const events = Array.from({ length: 3 }, (_, i) => ({ id: i + 1, fecha: new Date("2025-09-19") }));
  Banio.findAll = vi.fn().mockResolvedValue(events);
  Vacuna.findAll = vi.fn().mockResolvedValue([]);
  Desparasitacion.findAll = vi.fn().mockResolvedValue([]);

  const pagination: Partial<PaginationDto> = {
    page: 2,
    size: 5,
    getOffset: () => 5,
    getOrder: () => [],
  };

  const result = await service.findAll(pagination as PaginationDto, "123", adminPayload);

  expect(result.data).toEqual([]);
  expect(result.count).toBe(3);
});


it("should return events sorted in insertion order (Banio, Vacuna, Desparasitacion)", async () => {
  RegistroSanidad.findOne = vi.fn().mockResolvedValue({ id: 1 });

  Banio.findAll = vi.fn().mockResolvedValue([{ id: 1, fecha: new Date("2025-01-01") }]);
  Vacuna.findAll = vi.fn().mockResolvedValue([{ id: 2, fecha: new Date("2025-02-01") }]);
  Desparasitacion.findAll = vi.fn().mockResolvedValue([{ id: 3, fecha: new Date("2025-03-01") }]);

  const pagination: Partial<PaginationDto> = {
    page: 1,
    size: 10,
    getOffset: () => 0,
    getOrder: () => [],
  };

  const result = await service.findAll(pagination as PaginationDto, "123", adminPayload);

  const actividades = result.data.map(r => r.actividad);
  expect(actividades).toEqual(["Baño", "Vacuna", "Desparasitación"]);
});

it("should handle pagination size 0", async () => {
  RegistroSanidad.findOne = vi.fn().mockResolvedValue({ id: 1 });

  Banio.findAll = vi.fn().mockResolvedValue([{ id: 1, fecha: new Date("2025-09-19") }]);
  Vacuna.findAll = vi.fn().mockResolvedValue([]);
  Desparasitacion.findAll = vi.fn().mockResolvedValue([]);

  const pagination: Partial<PaginationDto> = {
    page: 1,
    size: 0,
    getOffset: () => 0,
    getOrder: () => [],
  };

  const result = await service.findAll(pagination as PaginationDto, "123", adminPayload);

  expect(result.data).toEqual([]);
  expect(result.count).toBe(1);
});


it("should handle events with duplicated IDs", async () => {
  RegistroSanidad.findOne = vi.fn().mockResolvedValue({ id: 1 });

  const duplicateEvents = [
    { id: 1, fecha: new Date("2025-01-01") },
    { id: 1, fecha: new Date("2025-02-01") },
  ];

  Banio.findAll = vi.fn().mockResolvedValue(duplicateEvents);
  Vacuna.findAll = vi.fn().mockResolvedValue([]);
  Desparasitacion.findAll = vi.fn().mockResolvedValue([]);

  const pagination: Partial<PaginationDto> = {
    page: 1,
    size: 10,
    getOffset: () => 0,
    getOrder: () => [],
  };

  const result = await service.findAll(pagination as PaginationDto, "123", adminPayload);

  expect(result.data).toHaveLength(2);
  expect(result.data.map(r => r.id)).toEqual([1, 1]);
  expect(result.count).toBe(2);
});


});
