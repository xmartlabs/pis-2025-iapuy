import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/app/models/user.entity", () => ({
  User: class {
    static findAll = vi.fn();
    static create = vi.fn();
    static findOne = vi.fn();
    static destroy = vi.fn();
  },
}));

vi.mock("@/app/models/intervencion.entity", () => ({
  Intervencion: class {
    static findAll = vi.fn();
    static create = vi.fn();
    static findOne = vi.fn();
    static destroy = vi.fn();
  },
}));

vi.mock("@/app/models/registro-sanidad.entity", () => ({
  RegistroSanidad: class {
    static findAll = vi.fn();
    static create = vi.fn();
    static findOne = vi.fn();
    static destroy = vi.fn();
  },
}));

vi.mock("@/app/models/perro.entity", () => ({
  Perro: class {
    static findAll = vi.fn();
    static create = vi.fn();
    static findOne = vi.fn();
    static destroy = vi.fn();
  },
}));

vi.mock("@/app/models/usrperro.entity", () => ({
  UsrPerro: class {
    static findAll = vi.fn();
    static create = vi.fn();
    static findOne = vi.fn();
    static destroy = vi.fn();
  },
}));

vi.mock("@/app/models/vacuna.entity", () => ({
  Vacuna: class {
    static findAll = vi.fn();
    static create = vi.fn();
    static findOne = vi.fn();
    static destroy = vi.fn();
  },
}));

import { PerrosController } from "@/app/api/perros/controller/perros.controller";
import type { NextRequest } from "next/server";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";

interface MockService { findAll: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; findOne: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>; }

describe("PerrosController", () => {
  let controller: PerrosController = {} as PerrosController; 
  let service: MockService = {} as unknown as MockService;

  beforeEach(() => {
    service = {
      findAll: vi.fn(),
      create: vi.fn(),
      findOne: vi.fn(),
      delete: vi.fn(),
    };
    controller = new PerrosController(service);
    vi.clearAllMocks();
  });

  it("getPerros should return a list of dogs", async () => { 
    service.findAll.mockResolvedValue({ 
      data: [{ id: 1, nombre: "Rex" }] });

    const res = await controller.getPerros({} as unknown as PaginationDto);

    expect(service.findAll).toHaveBeenCalled(); 
    expect(res.data[0].nombre).toBe("Rex"); });

  it("createPerro should return the created dog", async () => 
    { service.create.mockResolvedValue({ id: 2, nombre: "Lassie" }); 
  const mockRequest = 
  { json: vi.fn().mockResolvedValue({ 
    nombre: "Lassie", 
    descripcion: "Collie", 
    fortalezas: "Inteligente", 
    duenioId: "321", }), } as unknown as NextRequest; 

    const res = await controller.createPerro(mockRequest); 
    expect(service.create).toHaveBeenCalledWith({ 
      nombre: "Lassie", 
      descripcion: "Collie", 
      fortalezas: "Inteligente", 
      duenioId: "321", }); 
      expect(res.nombre).toBe("Lassie"); });

  it("createPerro should propagate an error if the service fails", async () => {
    service.create.mockRejectedValue(new Error("DB error"));

    const mockRequest = {
      json: vi.fn().mockResolvedValue({ nombre: "ErrorDog" }),
    } as unknown as NextRequest;

    await expect(controller.createPerro(mockRequest)).rejects.toThrow("DB error");
  });
});