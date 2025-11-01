/* eslint-disable */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { InstitucionesController } from "./institucion.controller";
import type { PaginationDto } from "@/lib/pagination/pagination.dto";
import type { InstitucionesService } from "../service/instituciones.service";

vi.mock("../service/instituciones.service", () => ({
  InstitucionesService: vi.fn().mockImplementation(() => ({
    findOne: vi.fn(),
    findInterventions: vi.fn(),
    findAll: vi.fn(),
    findAllSimple: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    interventionsPDF: vi.fn(),
  })),
}));

describe("InstitucionesController", () => {
  // Declare mockService before initializing the controller
  const mockService: {
    findOne: ReturnType<typeof vi.fn>;
    findInterventions: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findAllSimple: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    interventionsPDF: ReturnType<typeof vi.fn>;
  } = {
    findOne: vi.fn(),
    findInterventions: vi.fn(),
    findAll: vi.fn(),
    findAllSimple: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    interventionsPDF: vi.fn(),
  };

  const controller = new InstitucionesController(mockService as unknown as InstitucionesService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getInstitution", () => {
    it("debería llamar a findOne del servicio y retornar el resultado", async () => {
      const mockInstitution = { id: "1", nombre: "Hospital" };
      mockService.findOne.mockResolvedValue(mockInstitution as never);

      const result = await controller.getInstitution("1");

      expect(mockService.findOne).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockInstitution);
    });
  });

  describe("getInterventions", () => {
    it("debería llamar a findInterventions del servicio y retornar el resultado", async () => {
      const mockInterventions = { data: [], totalPages: 0 };
      const pagination: PaginationDto = {
        page: 1,
        size: 10,
        query: "",
        getOffset: () => 0,
        getOrder: () => [],
      };
      const dates: Date[] = [];
      mockService.findInterventions.mockResolvedValue(
        mockInterventions as never,
      );

      const result = await controller.getInterventions("1", dates, pagination);

      expect(mockService.findInterventions).toHaveBeenCalledWith(
        "1",
        dates,
        pagination,
      );
      expect(result).toEqual(mockInterventions);
    });
  });

  describe("getInstitutions", () => {
    it("delegates to findAll with pagination", async () => {
      const pagination: PaginationDto = {
        page: 1,
        size: 10,
        query: "",
        getOffset: () => 0,
        getOrder: () => [],
      } as PaginationDto;
      const expected = { rows: [], count: 0 } as any;
      mockService.findAll.mockResolvedValue(expected as never);

      const res = await controller.getInstitutions(pagination);

      expect(mockService.findAll).toHaveBeenCalledWith(pagination);
      expect(res).toBe(expected);
    });
  });

  describe("getInstitutionsSimple", () => {
    it("delegates to findAllSimple and returns result", async () => {
      const expected = [{ id: "1", nombre: "X" }];
      mockService.findAllSimple.mockResolvedValue(expected as never);
      const res = await controller.getInstitutionsSimple();
      expect(mockService.findAllSimple).toHaveBeenCalled();
      expect(res).toBe(expected);
    });
  });

  describe("create/update/delete and PDF flows", () => {
    it("createInstitution reads body and delegates to service.create", async () => {
      const body = { nombre: "New" };
      const req = { json: () => body } as unknown as Request;
      mockService.create.mockResolvedValue({ id: "10", ...body } as never);

      // @ts-ignore - NextRequest shape for test
      const res = await controller.createInstitution(req as any);
      expect(mockService.create).toHaveBeenCalledWith(body);
      expect(res).toEqual({ id: "10", ...body });
    });

    it("updateInstitution reads body and delegates to service.update", async () => {
      const body = { nombre: "Upd" };
      const req = { json: () => body } as unknown as Request;
      mockService.update.mockResolvedValue({ id: "10", ...body } as never);

      // @ts-ignore
      const res = await controller.updateInstitution(req as any, "10");
      expect(mockService.update).toHaveBeenCalledWith("10", body);
      expect(res).toEqual({ id: "10", ...body });
    });

    it("deleteInstitution delegates to service.delete", async () => {
      mockService.delete.mockResolvedValue(undefined as never);
      await controller.deleteInstitution("5");
      expect(mockService.delete).toHaveBeenCalledWith("5");
    });

    it("interventionsPDF reads dates from body and delegates to service.interventionsPDF", async () => {
      const dates = [new Date()];
      const req = { json: () => ({ dates }) } as unknown as Request;
      mockService.interventionsPDF.mockResolvedValue("pdf-bytes" as never);

      // @ts-ignore
      const res = await controller.interventionsPDF(req as any, "1");
      expect(mockService.interventionsPDF).toHaveBeenCalledWith("1", dates);
      expect(res).toBe("pdf-bytes");
    });
  });
});
