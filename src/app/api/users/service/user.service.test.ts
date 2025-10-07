import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { UserService } from "./user.service";
import { User } from "@/app/models/user.entity";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { CreateUserDto } from "../dtos/create-user.dto";

// ---- Mocks ----
vi.mock("@/app/models/user.entity", () => ({
  User: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock("../../../models/intervencion.entity", () => ({
  Intervencion: {},
}));

vi.mock("@/app/models/perro.entity", () => ({
  Perro: {},
}));

// ---- Tests ----
describe("UserService", () => {
  // eslint-disable-next-line init-declarations
  let service!: UserService;

  beforeEach(() => {
    service = new UserService();
    vi.clearAllMocks();
  });

  // ---- CU Listar Usuarios ----
  it("findAll should return paginated users", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findAndCountAllMock = User.findAndCountAll as Mock;
    findAndCountAllMock.mockResolvedValue({
      rows: [],
      count: 0,
    });

    const pagination: PaginationDto = {
      query: "",
      size: 10,
      page: 1,
      getOffset: () => 0,
      getOrder: () => [],
    };

    const result = await service.findAll(pagination);

    expect(findAndCountAllMock).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("findOne should return a user", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findByPkMock = User.findByPk as Mock;
    const mockUser = { ci: "12345678", nombre: "Pepe" };
    findByPkMock.mockResolvedValue(mockUser);

    const result = await service.findOne("12345678");

    expect(findByPkMock).toHaveBeenCalledWith("12345678", expect.any(Object));
    expect(result).toEqual(mockUser);
  });

  it("create should create a user", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const createMock = User.create as Mock;
    const newUser: CreateUserDto = {
      ci: "12345678",
      password: "1234",
      nombre: "Pepe",
      celular: "099999999",
      banco: "Banco X",
      cuentaBancaria: "1234567890",
    };

    createMock.mockResolvedValue(newUser);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await service.create(newUser);

    expect(createMock).toHaveBeenCalledWith(newUser);
    expect(result).toEqual(newUser);
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
      where: { username: "12345678" },
    });
    expect(result).toBe(true);
  });

  it("delete should return false if not deleted", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const destroyMock = User.destroy as Mock;
    destroyMock.mockResolvedValue(0);

    const result = await service.delete("12345678");

    expect(destroyMock).toHaveBeenCalledWith({
      where: { username: "12345678" },
    });
    expect(result).toBe(false);
  });

  // ---- CU Consultar/Editar Perfil ----
  it("consultar perfil should return an existing user", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findByPkMock = User.findByPk as Mock;
    const mockUser = { ci: "12345678", nombre: "Juan", celular: "099111222" };
    findByPkMock.mockResolvedValue(mockUser);

    const result = await service.findOne("12345678");

    expect(findByPkMock).toHaveBeenCalledWith("12345678", expect.any(Object));
    expect(result).toEqual(mockUser);
  });

  it("consultar perfil should return null if user does not exist", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findByPkMock = User.findByPk as Mock;
    findByPkMock.mockResolvedValue(null);

    const result = await service.findOne("00000000");

    expect(result).toBeNull();
  });

  // ---- CU Consultar/Editar Perfil ----
  it("editar perfil should update user data", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findByPkMock = User.findByPk as Mock;
    const updateMock = vi.fn().mockResolvedValue({
      ci: "12345678",
      nombre: "Carlos",
      celular: "099333444",
    });

    findByPkMock.mockResolvedValue({ update: updateMock });

    const result = await service.update("12345678", {
      nombre: "Carlos",
      celular: "099333444",
    });

    expect(findByPkMock).toHaveBeenCalledWith("12345678");
    expect(updateMock).toHaveBeenCalledWith({
      nombre: "Carlos",
      celular: "099333444",
    });
    expect(result).toEqual({
      ci: "12345678",
      nombre: "Carlos",
      celular: "099333444",
    });
  });

  it("editar perfil should return null if user does not exist", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const findByPkMock = User.findByPk as Mock;
    findByPkMock.mockResolvedValue(null);

    const result = await service.update("99999999", {
      nombre: "Nuevo",
    });

    expect(result).toBeNull();
  });
});
