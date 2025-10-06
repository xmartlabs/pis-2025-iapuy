import { describe, it, expect, vi, beforeEach } from "vitest";

import { AuthService } from "./auth.service";
import jwt from "jsonwebtoken";

vi.mock("jsonwebtoken");
const mockJwtSign = jwt.sign as jest.Mock;

// Mock UserService methods
vi.mock("../../users/service/user.service", () => ({
  UserService: vi.fn().mockImplementation(() => ({
    findOneForAuth: vi.fn(),
  })),
}));

vi.mock("@/lib/crypto/hash", () => ({
  Hashing: {
    verifyPassword: vi.fn(),
  },
}));

describe("AuthService - login", () => {
  // Define el grupo de tests para AuthService.
  let service: AuthService;
  let userServiceMock: any;

  beforeEach(() => {
    userServiceMock = {
      findOneForAuth: vi.fn(),
    };
    service = new AuthService(userServiceMock);
    vi.clearAllMocks();
  });
  // Antes de cada test, crea una nueva instancia de AuthService y limpia los mocks.

  it("debe devolver error con credenciales inválidas", async () => {
    userServiceMock.findOneForAuth.mockResolvedValue(null);

    const result = await service.login("fake", "wrong");
    expect(userServiceMock.findOneForAuth).toHaveBeenCalled();
    expect(result).toEqual({
      error: "Credenciales inválidas",
      status: 401,
    });
  });

  it("debe devolver error si la contraseña es incorrecta", async () => {
    userServiceMock.findOneForAuth.mockResolvedValue({
      ci: "123",
      nombre: "Test name",
      password: "hashedpass",
      esAdmin: false,
    });
    const result = await service.login("123", "wrongpass");
    expect(userServiceMock.findOneForAuth).toHaveBeenCalled();
    expect(result).toEqual({
      error: "Credenciales inválidas",
      status: 401,
    });
  });

  it("debe poder loguearse con credenciales de colaborador correctas", async () => {
    userServiceMock.findOneForAuth.mockResolvedValue({
      ci: "123",
      nombre: "Test name",
      password: "hashedpass",
      esAdmin: false,
    });
    const { Hashing } = await import("@/lib/crypto/hash");

    (Hashing.verifyPassword as any).mockResolvedValue(true);
    mockJwtSign.mockImplementation((payload) => "TOKEN-" + payload.type);

    const result = await service.login("123", "wrongpass");
    expect(result.status).toBe(200);
    expect(userServiceMock.findOneForAuth).toHaveBeenCalled();
    expect(result.accessToken).toBe("TOKEN-Colaborador"); // Asumo TipoUsuario.Colaborador = 1 o el valor que tenga
    expect(result.refreshToken).toBe("TOKEN-Colaborador");
    expect(jwt.sign).toHaveBeenCalledTimes(2);
  });

  it("debe poder loguearse con credenciales de administrador correctas", async () => {
    userServiceMock.findOneForAuth.mockResolvedValue({
      ci: "123",
      nombre: "Test name",
      password: "hashedpass",
      esAdmin: true,
    });
    const { Hashing } = await import("@/lib/crypto/hash");

    (Hashing.verifyPassword as any).mockResolvedValue(true);
    mockJwtSign.mockImplementation((payload) => "TOKEN-" + payload.type);

    const result = await service.login("123", "wrongpass");
    expect(result.status).toBe(200);
    expect(userServiceMock.findOneForAuth).toHaveBeenCalled();
    expect(result.accessToken).toBe("TOKEN-Administrador"); // Asumo TipoUsuario.Colaborador = 1 o el valor que tenga
    expect(result.refreshToken).toBe("TOKEN-Administrador");
    expect(jwt.sign).toHaveBeenCalledTimes(2);
  });
});

describe("AuthService - refresh", () => {
  // Define el grupo de tests para AuthService.
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    vi.clearAllMocks();
  });
  // Antes de cada test, crea una nueva instancia de AuthService y limpia los mocks.

  it("debe poder refrescar el access token", async () => {
    (jwt.verify as vi.Mock).mockReturnValue({
      ci: "123",
      name: "Laura",
      type: "Colaborador",
    });

    const result = service.refresh("valid-refresh-token");

    // Assert
    expect(jwt.verify).toHaveBeenCalledWith(
      "valid-refresh-token",
      process.env.JWT_SECRET
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { ci: "123", name: "Laura", type: "Colaborador" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    expect(result).toEqual({
      accessToken: "TOKEN-Colaborador",
      status: 200,
    });
  });
  it("debe devolver error cuando el refresh token es invalido", () => {
    (jwt.verify as vi.Mock).mockImplementation(() => {
      throw new Error("invalid token");
    });

    expect(() => service.refresh("bad-token")).toThrow("invalid token");
  });
});
