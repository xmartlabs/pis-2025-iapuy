import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthController } from "@/app/api/auth/controller/auth.controller";
import { type NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";

// Mock AuthService methods
vi.mock("../service/auth.service", () => ({
  AuthService: vi.fn().mockImplementation(() => ({
    login: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock NextResponse.json
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, opts) => ({ data, ...opts })),
  },
}));

describe("AuthController", () => {
  let controller: AuthController;
  let service: any;

  beforeEach(() => {
    service = {
      refresh: vi.fn(),
      login: vi.fn(),
    };
    controller = new AuthController(service);
    vi.clearAllMocks();
  });

  describe("AuthController - login", () => {
    it("debe devolver error con credenciales inválidas", async () => {
      service.login.mockResolvedValue({
        status: 401,
        error: "Credenciales inválidas",
      });

      const req = {
        json: async () => ({ ci: "fake", password: "wrong" }),
      };

      const result = await controller.login(req as any);

      expect(service.login).toHaveBeenCalled();
      expect(result.status).toBe(401);
      expect(result.error).toBe("Credenciales inválidas");
    });

    it("debe poder loguearse con credenciales correctas", async () => {
      service.login.mockResolvedValue({
        status: 200,
        accessToken: "mockedAccessToken",
        refreshToken: "mockedRefreshToken",
      });

      const req = {
        json: async () => ({ ci: "right", password: "wrong" }),
      };

      const result = await controller.login(req as any);

      expect(service.login).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });
  });

  describe("AuthController - refresh", () => {
    it("debe devolver error sin un refresh token", async () => {
      const mockRequest = {
        headers: {
          get: (key: string) => {
            if (key === "cookie") return null;
            return null;
          },
        },
      } as unknown as NextRequest;

      const result = await controller.refresh(mockRequest);
      expect(result.status).toBe(401);
      expect(result.error).toBe(
        "No se encontro un token de refresco en la solicitud."
      );
    });

    it("debe poder refrescar el access token", async () => {
      service.refresh.mockResolvedValue({
        status: 200,
        accessToken: "mockedAccessToken",
      });
      const refreshToken = jwt.sign(
        { ci: "ci", nombre: "nombre", tipo: "Colaborador" },
        JWT_SECRET,
        { expiresIn: "180d" }
      );
      const mockRequest = {
        headers: {
          get: (key: string) => {
            if (key === "cookie") return `refreshToken=${refreshToken}`;
            return null;
          },
        },
      } as unknown as NextRequest;

      const result = await controller.refresh(mockRequest);

      expect(service.refresh).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(result).toHaveProperty("accessToken");
    });
  });
});
