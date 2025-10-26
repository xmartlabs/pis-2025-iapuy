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
    interventionsPDF: ReturnType<typeof vi.fn>;
  } = {
    findOne: vi.fn(),
    findInterventions: vi.fn(),
    findAll: vi.fn(),
    findAllSimple: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
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
});
