import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data: unknown, opts?: ResponseInit) => ({ data, ...opts })),
  },
}));

import { UserController } from "./user.controller";
import type { UserService } from "../service/user.service";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { CreateUserDto } from "../dtos/create-user.dto";
import type { NextRequest } from "next/server";

// --- Global mocks (must be defined before imports using them) ---
vi.mock("@/lib/database", () => ({
  sequelize: {
    authenticate: vi.fn(),
    sync: vi.fn(),
  },
}));

// mockear modelos como clases vacías
vi.mock("@/app/models/user.entity", () => ({ User: class User {} }));
vi.mock("@/app/models/perro.entity", () => ({ Perro: class Perro {} }));
vi.mock("@/app/models/intervencion.entity", () => ({ Intervencion: class Intervencion {} }));
vi.mock("@/app/models/acompania.entity", () => ({ Acompania: class Acompania {} }));
vi.mock("@/app/models/registro-sanidad.entity", () => ({ RegistroSanidad: class RegistroSanidad {} }));
vi.mock("@/app/models/banio.entity", () => ({ Banio: class Banio {} }));
vi.mock("@/app/models/desparasitacion.entity", () => ({ Desparasitacion: class Desparasitacion {} }));
vi.mock("@/app/models/expense.entity", () => ({ Expense: class Expense {} }));
vi.mock("@/app/models/institucion.entity", () => ({ Institucion: class Institucion {} }));
vi.mock("@/app/models/institucion-intervenciones.entity", () => ({ InstitucionIntervencion: class InstitucionIntervencion {} }));
vi.mock("@/app/models/patologia.entity", () => ({ Patologia: class Patologia {} }));
vi.mock("@/app/models/usrperro.entity", () => ({ UsrPerro: class UsrPerro {} }));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: class Vacuna {} }));
vi.mock("@/app/models/institution-contact.entity", () => ({ InstitutionContact: class InstitutionContact {} }));
vi.mock("@/app/models/intitucion-patalogia.entity", () => ({ InstitucionPatologias: class InstitucionPatologias {} }));

// --- Utility to create mock services ---
function createMockUserService(): jest.Mocked<UserService> {
  return {
    findAll: vi.fn(),
    findOne: vi.fn(),
    findOneWithToken: vi.fn(),
    findDogIdsByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as jest.Mocked<UserService>;
}

describe("UserController", () => {
  // eslint-disable-next-line init-declarations
  let controller: UserController;
  // eslint-disable-next-line init-declarations
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    vi.clearAllMocks();
    userService = createMockUserService();
    controller = new UserController(userService);
  });

  // ---------------------- getUsers ----------------------
  it("should return paginated users", async () => {
    const pagination: PaginationDto = {
      query: "",
      size: 10,
      page: 1,
      getOffset: () => 0,
      getOrder: () => [],
    };

    const mockResponse = { rows: [], count: 0 };
    userService.findAll.mockResolvedValue(mockResponse as never);

    const result = await controller.getUsers(pagination);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.findAll).toHaveBeenCalledWith(pagination);
    expect(result).toEqual(mockResponse);
  });

  // ---------------------- getUser ----------------------
  it("should return user when found", async () => {
    const mockUser = { ci: "12345678", nombre: "John Doe" };
    userService.findOne.mockResolvedValue(mockUser as never);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = {
        json: vi.fn(),
        headers: {
            get: vi.fn().mockReturnValue(null),
        },
    } as unknown as NextRequest;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await controller.getUser(req, { ci: "12345678" });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.findOne).toHaveBeenCalledWith("12345678");
    expect(result).toEqual(mockUser);
  });

  it("should throw an error when user is not found", async () => {
    userService.findOne.mockResolvedValue(null as never);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = {} as NextRequest;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await expect(controller.getUser(req, { ci: "99999999" })).rejects.toThrow(
      "Usuario no encontrado"
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.findOne).toHaveBeenCalledWith("99999999");
  });

  // ---------------------- createUser ----------------------
  it("should return 201 and success message when user is created", async () => {
    const newUser: CreateUserDto = {
        ci: "1",
        password: "pw",
        nombre: "Alice",
        celular: "",
        banco: "",
        cuentaBancaria: "",
        rol: "admin",
        perros: []
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = {
      json: vi.fn().mockResolvedValue(newUser),
    } as unknown as NextRequest;

    userService.create.mockResolvedValue("1" as never);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await controller.createUser(req);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.create).toHaveBeenCalledWith(newUser);
    expect(result).toEqual({
      message: "Usuario con ci 1 creado con éxito",
      status: 201,
    });
  });

  it("should throw error if userService.create rejects", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = {
      json: vi.fn().mockResolvedValue({ ci: "1", password: "pw" }),
    } as unknown as NextRequest;

    userService.create.mockRejectedValue(new Error("fail"));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await expect(controller.createUser(req)).rejects.toThrow("fail");
  });

  // ---------------------- updateUser ----------------------
  it("should return updated user when found", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const req = {
      json: vi.fn().mockResolvedValue({ nombre: "Updated" }),
    } as unknown as NextRequest;
    const updatedUser = { ci: "123", nombre: "Updated" };

    userService.update.mockResolvedValue(updatedUser as never);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await controller.updateUser(req, { username: "123" });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.update).toHaveBeenCalledWith("123", {
      nombre: "Updated",
    });
    expect(result).toEqual( updatedUser );
  });

  // ---------------------- deleteUser ----------------------
  it("should return true if deleted", async () => {
    userService.delete.mockResolvedValue(true as never);

    const result = await controller.deleteUser("123");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.delete).toHaveBeenCalledWith("123");
    expect(result).toBe(true);
  });
});
