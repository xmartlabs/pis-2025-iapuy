import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ----- MOCKS (deben ir antes de importar el controller) -----
vi.mock("@/app/models/user.entity", () => ({ User: {} }));
vi.mock("@/app/models/usrperro.entity", () => ({ UsrPerro: {} }));
vi.mock("@/app/models/perro.entity", () => ({ Perro: {} }));
vi.mock("@/app/models/intervencion.entity", () => ({ Intervencion: {} }));
vi.mock("@/app/models/registro-sanidad.entity", () => ({ RegistroSanidad: {} }));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: {} }));

vi.mock("../service/user.service", () => ({
  UserService: vi.fn().mockImplementation(() => ({
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, opts) => ({ data, ...opts })),
  },
}));
// -------------------------------------------------------------

import { UserController } from "./user.controller";
import { NextResponse } from "next/server";

describe("UserController", () => {
  let controller: UserController;
  let userService: any;

  beforeEach(() => {
    // limpiar mocks primero para evitar efectos entre tests
    vi.clearAllMocks();

    // Create a fresh mock for each test
    userService = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    // Inject the mock into the controller
    controller = new UserController(userService);
  });

  /* --- tus tests tal cual --- */
  it("getUsers returns paginated users", async () => {
    userService.findAll.mockResolvedValue({ rows: [], count: 0 });
    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await controller.getUsers(pagination as any);
    expect(userService.findAll).toHaveBeenCalledWith(pagination);
    expect(result).toEqual({ rows: [], count: 0 });
  });

  it("getUser returns user if found", async () => {
    userService.findOne.mockResolvedValue({ username: "test" });
    const req = {} as any;
    const result = await controller.getUser(req, { username: "test" });
    expect(userService.findOne).toHaveBeenCalledWith("test");
    expect(NextResponse.json).toHaveBeenCalledWith({ username: "test" });
    expect(result).toEqual({ data: { username: "test" } });
  });

  it("getUser returns 404 if not found", async () => {
    userService.findOne.mockResolvedValue(null);
    const req = {} as any;
    const result = await controller.getUser(req, { username: "notfound" });
    expect(NextResponse.json).toHaveBeenCalledWith({ error: "User not found" }, { status: 404 });
    expect(result).toEqual({ data: { error: "User not found" }, status: 404 });
  });

  it("getUser returns 500 on error", async () => {
    userService.findOne.mockRejectedValue(new Error("fail"));
    const req = {} as any;
    const result = await controller.getUser(req, { username: "test" });
    expect(NextResponse.json).toHaveBeenCalledWith({ error: "Internal Server Error" }, { status: 500 });
    expect(result).toEqual({ data: { error: "Internal Server Error" }, status: 500 });
  });

  it("createUser returns 400 if ci or password missing", async () => {
    const req = { json: vi.fn().mockResolvedValue({}) } as any;
    const result = await controller.createUser(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Username and password are required" },
      { status: 400 }
    );
    expect(result).toEqual({ data: { error: "Username and password are required" }, status: 400 });
  });

  it("createUser returns 201 and user if created", async () => {
    const req = { json: vi.fn().mockResolvedValue({ ci: "1", password: "pw" }) } as any;
    userService.create.mockResolvedValue({ username: "created" });
    const result = await controller.createUser(req);
    expect(userService.create).toHaveBeenCalledWith({ ci: "1", password: "pw" });
    expect(NextResponse.json).toHaveBeenCalledWith({ username: "created" }, { status: 201 });
    expect(result).toEqual({ data: { username: "created" }, status: 201 });
  });

  it("createUser returns 409 if username exists", async () => {
    const req = { json: vi.fn().mockResolvedValue({ ci: "1", password: "pw" }) } as any;
    const error = new Error("exists") as any;
    error.name = "SequelizeUniqueConstraintError";
    userService.create.mockRejectedValue(error);
    const result = await controller.createUser(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Username already exists" },
      { status: 409 }
    );
    expect(result).toEqual({ data: { error: "Username already exists" }, status: 409 });
  });

  it("createUser returns 500 on other errors", async () => {
    const req = { json: vi.fn().mockResolvedValue({ ci: "1", password: "pw" }) } as any;
    userService.create.mockRejectedValue(new Error("fail"));
    const result = await controller.createUser(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    expect(result).toEqual({ data: { error: "Internal Server Error" }, status: 500 });
  });

  it("updateUser returns updated user if found", async () => {
    const req = { json: vi.fn().mockResolvedValue({ password: "new" }) } as any;
    userService.update.mockResolvedValue({ username: "test", password: "new" });
    const result = await controller.updateUser(req, { username: "test" });
    expect(userService.update).toHaveBeenCalledWith("test", { password: "new" });
    expect(NextResponse.json).toHaveBeenCalledWith({ username: "test", password: "new" });
    expect(result).toEqual({ data: { username: "test", password: "new" } });
  });

  it("updateUser returns 404 if user not found", async () => {
    const req = { json: vi.fn().mockResolvedValue({}) } as any;
    userService.update.mockResolvedValue(null);
    const result = await controller.updateUser(req, { username: "notfound" });
    expect(NextResponse.json).toHaveBeenCalledWith({ error: "User not found" }, { status: 404 });
    expect(result).toEqual({ data: { error: "User not found" }, status: 404 });
  });

  it("updateUser returns 500 on error", async () => {
    const req = { json: vi.fn().mockResolvedValue({}) } as any;
    userService.update.mockRejectedValue(new Error("fail"));
    const result = await controller.updateUser(req, { username: "test" });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    expect(result).toEqual({ data: { error: "Internal Server Error" }, status: 500 });
  });

  it("deleteUser returns success message if deleted", async () => {
    userService.delete.mockResolvedValue(true);
    const req = {} as any;
    const result = await controller.deleteUser(req, { username: "test" });
    expect(userService.delete).toHaveBeenCalledWith("test");
    expect(NextResponse.json).toHaveBeenCalledWith({ message: "User deleted successfully" });
    expect(result).toEqual({ data: { message: "User deleted successfully" } });
  });

  it("deleteUser returns 404 if user not found", async () => {
    userService.delete.mockResolvedValue(false);
    const req = {} as any;
    const result = await controller.deleteUser(req, { username: "notfound" });
    expect(NextResponse.json).toHaveBeenCalledWith({ error: "User not found" }, { status: 404 });
    expect(result).toEqual({ data: { error: "User not found" }, status: 404 });
  });

  it("deleteUser returns 500 on error", async () => {
    userService.delete.mockRejectedValue(new Error("fail"));
    const req = {} as any;
    const result = await controller.deleteUser(req, { username: "test" });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    expect(result).toEqual({ data: { error: "Internal Server Error" }, status: 500 });
  });
});






/*import { describe, it, expect, vi, beforeEach } from "vitest";

import "reflect-metadata";

// Mock UserService methods
vi.mock("@/app/models/user.entity", () => ({ User: {} }));
vi.mock("@/app/models/usrperro.entity", () => ({ UsrPerro: {} }));
vi.mock("@/app/models/perro.entity", () => ({ Perro: {} }));
vi.mock("@/app/models/intervencion.entity", () => ({ Intervencion: {} }));
vi.mock("@/app/models/registro-sanidad.entity", () => ({ RegistroSanidad: {} }));
vi.mock("@/app/models/vacuna.entity", () => ({ Vacuna: {} }));

vi.mock("../service/user.service", () => ({
  UserService: vi.fn().mockImplementation(() => ({
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, opts) => ({ data, ...opts })),
  },
}));


import { UserController } from "./user.controller";
//import { UserService } from "../service/user.service";
import { NextResponse } from "next/server";

describe("UserController", () => {
  let controller: UserController;
  let userService: any;

  beforeEach(() => {
    // Create a fresh mock for each test
    userService = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    // Inject the mock into the controller
    controller = new UserController(userService);
    vi.clearAllMocks();
  });

  it("getUsers returns paginated users", async () => {
    userService.findAll.mockResolvedValue({ rows: [], count: 0 });
    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    const result = await controller.getUsers(pagination as any);
    expect(userService.findAll).toHaveBeenCalledWith(pagination);
    expect(result).toEqual({ rows: [], count: 0 });
  });

  it("getUser returns user if found", async () => {
    userService.findOne.mockResolvedValue({ username: "test" });
    const req = {} as any;
    const result = await controller.getUser(req, { username: "test" });
    expect(userService.findOne).toHaveBeenCalledWith("test");
    expect(NextResponse.json).toHaveBeenCalledWith({ username: "test" });
    expect(result).toEqual({ data: { username: "test" } });
  });

  it("getUser returns 404 if not found", async () => {
    userService.findOne.mockResolvedValue(null);
    const req = {} as any;
    const result = await controller.getUser(req, { username: "notfound" });
    expect(NextResponse.json).toHaveBeenCalledWith({ error: "User not found" }, { status: 404 });
    expect(result).toEqual({ data: { error: "User not found" }, status: 404 });
  });

  it("getUser returns 500 on error", async () => {
    userService.findOne.mockRejectedValue(new Error("fail"));
    const req = {} as any;
    const result = await controller.getUser(req, { username: "test" });
    expect(NextResponse.json).toHaveBeenCalledWith({ error: "Internal Server Error" }, { status: 500 });
    expect(result).toEqual({ data: { error: "Internal Server Error" }, status: 500 });
  });

  it("createUser returns 400 if ci or password missing", async () => {
    const req = { json: vi.fn().mockResolvedValue({}) } as any;
    const result = await controller.createUser(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Username and password are required" },
      { status: 400 }
    );
    expect(result).toEqual({ data: { error: "Username and password are required" }, status: 400 });
  });

  it("createUser returns 201 and user if created", async () => {
    const req = { json: vi.fn().mockResolvedValue({ ci: "1", password: "pw" }) } as any;
    userService.create.mockResolvedValue({ username: "created" });
    const result = await controller.createUser(req);
    expect(userService.create).toHaveBeenCalledWith({ ci: "1", password: "pw" });
    expect(NextResponse.json).toHaveBeenCalledWith({ username: "created" }, { status: 201 });
    expect(result).toEqual({ data: { username: "created" }, status: 201 });
  });

  it("createUser returns 409 if username exists", async () => {
    const req = { json: vi.fn().mockResolvedValue({ ci: "1", password: "pw" }) } as any;
    const error = new Error("exists") as any;
    error.name = "SequelizeUniqueConstraintError";
    userService.create.mockRejectedValue(error);
    const result = await controller.createUser(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Username already exists" },
      { status: 409 }
    );
    expect(result).toEqual({ data: { error: "Username already exists" }, status: 409 });
  });

  it("createUser returns 500 on other errors", async () => {
    const req = { json: vi.fn().mockResolvedValue({ ci: "1", password: "pw" }) } as any;
    userService.create.mockRejectedValue(new Error("fail"));
    const result = await controller.createUser(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    expect(result).toEqual({ data: { error: "Internal Server Error" }, status: 500 });
  });

  it("updateUser returns updated user if found", async () => {
    const req = { json: vi.fn().mockResolvedValue({ password: "new" }) } as any;
    userService.update.mockResolvedValue({ username: "test", password: "new" });
    const result = await controller.updateUser(req, { username: "test" });
    expect(userService.update).toHaveBeenCalledWith("test", { password: "new" });
    expect(NextResponse.json).toHaveBeenCalledWith({ username: "test", password: "new" });
    expect(result).toEqual({ data: { username: "test", password: "new" } });
  });

  it("updateUser returns 404 if user not found", async () => {
    const req = { json: vi.fn().mockResolvedValue({}) } as any;
    userService.update.mockResolvedValue(null);
    const result = await controller.updateUser(req, { username: "notfound" });
    expect(NextResponse.json).toHaveBeenCalledWith({ error: "User not found" }, { status: 404 });
    expect(result).toEqual({ data: { error: "User not found" }, status: 404 });
  });

  it("updateUser returns 500 on error", async () => {
    const req = { json: vi.fn().mockResolvedValue({}) } as any;
    userService.update.mockRejectedValue(new Error("fail"));
    const result = await controller.updateUser(req, { username: "test" });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    expect(result).toEqual({ data: { error: "Internal Server Error" }, status: 500 });
  });

  it("deleteUser returns success message if deleted", async () => {
    userService.delete.mockResolvedValue(true);
    const req = {} as any;
    const result = await controller.deleteUser(req, { username: "test" });
    expect(userService.delete).toHaveBeenCalledWith("test");
    expect(NextResponse.json).toHaveBeenCalledWith({ message: "User deleted successfully" });
    expect(result).toEqual({ data: { message: "User deleted successfully" } });
  });

  it("deleteUser returns 404 if user not found", async () => {
    userService.delete.mockResolvedValue(false);
    const req = {} as any;
    const result = await controller.deleteUser(req, { username: "notfound" });
    expect(NextResponse.json).toHaveBeenCalledWith({ error: "User not found" }, { status: 404 });
    expect(result).toEqual({ data: { error: "User not found" }, status: 404 });
  });

  it("deleteUser returns 500 on error", async () => {
    userService.delete.mockRejectedValue(new Error("fail"));
    const req = {} as any;
    const result = await controller.deleteUser(req, { username: "test" });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Internal Server Error" },
      { status: 500 }
    );
    expect(result).toEqual({ data: { error: "Internal Server Error" }, status: 500 });
  });
});
*/