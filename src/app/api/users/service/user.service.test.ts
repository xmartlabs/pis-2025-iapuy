import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { UserService } from "./user.service";
import { User } from "@/app/models/user.entity";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { CreateUserDto } from "../dtos/create-user.dto";

vi.mock("@/lib/database", () => ({
  __esModule: true,
  default: {
    transaction: vi.fn().mockResolvedValue({
      commit: vi.fn(),
      rollback: vi.fn(),
    }),
  },
}));

vi.mock("@/app/models/user.entity", () => ({
  User: {
    findAll: vi.fn(),
    count: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock("../../../models/intervencion.entity", () => ({
  Intervencion: {},
}));

vi.mock("@/app/models/perro.entity", () => ({
  Perro: {
    bulkCreate: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/app/models/acompania.entity", () => ({
  Acompania: {},
}));

vi.mock("@/app/models/registro-sanidad.entity", () => ({
  RegistroSanidad: {},
}));

vi.mock("@/app/models/banio.entity", () => ({
  Banio: {},
}));

vi.mock("@/app/models/desparasitacion.entity", () => ({
  Desparasitacion: {},
}));

vi.mock("@/app/models/expense.entity", () => ({
  Expense: {},
}));

vi.mock("@/app/models/institucion.entity", () => ({
  Institucion: {},
}));

vi.mock("@/app/models/institucion-intervenciones.entity", () => ({
  InstitucionIntervencion: {},
  InstitucionIntervenciones: {},
}));

vi.mock("@/app/models/patologia.entity", () => ({
  Patologia: {},
}));

vi.mock("@/app/models/usrperro.entity", () => ({
  UsrPerro: {},
}));

vi.mock("@/app/models/vacuna.entity", () => ({
  Vacuna: {},
}));

vi.mock("@/app/models/institution-contact.entity", () => ({
  InstitutionContact: {},
}));

vi.mock("@/app/models/intitucion-patalogia.entity", () => ({
  InstitucionPatologia: {},
  InstitucionPatologias: {},
}));

// ---- Tests ----
describe("UserService", () => {
  // eslint-disable-next-line init-declarations
  let service!: UserService;

  beforeEach(() => {
    service = new UserService();
    vi.clearAllMocks();
  });

  it("findAll should return paginated users", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findAllMock = User.findAll as Mock;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const countMock = User.count as Mock;
    findAllMock.mockResolvedValue([]);
    countMock.mockResolvedValue(0);

    const pagination: PaginationDto = {
      query: "",
      size: 10,
      page: 1,
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    expect(findAllMock).toHaveBeenCalled();
    expect(countMock).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("findOne should return a user", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findByPkMock = User.findByPk as Mock;
    const mockUser = { 
      ci: "12345678", 
      nombre: "Pepe",
      toJSON: vi.fn().mockReturnValue({ 
        ci: "12345678", 
        nombre: "Pepe", 
        perros: [],
        banco: null,
        celular: null,
        cuentaBancaria: null,
        esAdmin: false,
        isActivated: false,
      })
    };
    findByPkMock.mockResolvedValue(mockUser);

    const result = await service.findOne("12345678");

    expect(findByPkMock).toHaveBeenCalledWith("12345678", expect.any(Object));
    expect(result).toEqual({ 
      ci: "12345678", 
      nombre: "Pepe", 
      perros: [],
      banco: null,
      celular: null,
      cuentaBancaria: null,
      esAdmin: false,
      isActivated: false,
    });
  });

  it("create should create a user", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const createMock = User.create as Mock;
    const ci = "12345678";
    const newUser: CreateUserDto = {
      ci,
      password: "Password123",
      nombre: "Pepe",
      celular: "099999999",
      banco: "Banco X",
      cuentaBancaria: "1234567890",
      rol: "admin",
      perros: [],
    };

    createMock.mockResolvedValue(newUser);
    const result = await service.create(newUser);

    expect(createMock).toHaveBeenCalled();
    expect(result).toEqual(ci);
  });

  it("findOne should return null if user not found", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findByPkMock = User.findByPk as Mock;
    findByPkMock.mockResolvedValue(null);

    const result = await service.findOne("notfound");
    expect(result).toBeNull();
  });

  it("delete should return true if deleted", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const destroyMock = User.destroy as Mock;
    destroyMock.mockResolvedValue(1);

    const result = await service.delete("12345678");
    expect(destroyMock).toHaveBeenCalledWith({
      where: { ci: "12345678" },
    });
    expect(result).toBe(true);
  });

  it("delete should return false if not deleted", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const destroyMock = User.destroy as Mock;
    destroyMock.mockResolvedValue(0);

    const result = await service.delete("12345678");
    expect(result).toBe(false);
  });

  it("update should modify user if found", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findByPkMock = User.findByPk as Mock;
    const updateMock = vi.fn().mockResolvedValue({
      ci: "12345678",
      nombre: "Carlos",
    });
    findByPkMock.mockResolvedValue({ update: updateMock });

    const result = await service.update("12345678", { nombre: "Carlos" });

    expect(findByPkMock).toHaveBeenCalledWith("12345678");
    expect(updateMock).toHaveBeenCalledWith({ nombre: "Carlos" });
    expect(result).toEqual({ ci: "12345678", nombre: "Carlos" });
  });

  it("update should return null if user not found", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findByPkMock = User.findByPk as Mock;
    findByPkMock.mockResolvedValue(null);

    const result = await service.update("99999999", { nombre: "Nuevo" });
    expect(result).toBeNull();
  });
});
