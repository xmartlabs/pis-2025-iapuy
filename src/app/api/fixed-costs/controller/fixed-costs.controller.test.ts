import { describe, it, expect, vi, beforeEach } from "vitest";
import { FixedCostsController } from "./fixed-costs.controller";
import type UpdateFixedCostsDTO from "../dtos/fixed-costs.dto";

vi.mock("../service/fixed-costs.service", () => ({
  fixedCostsService: {
    getCostos: vi.fn(),
    setCostos: vi.fn(),
  },
}));

describe("FixedCostsController", () => {
  // eslint-disable-next-line init-declarations
  let controller: FixedCostsController;
  // eslint-disable-next-line init-declarations
  let mockService: {
    getCostos: ReturnType<typeof vi.fn>;
    setCostos: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const { fixedCostsService } = await import(
      "../service/fixed-costs.service"
    );
    mockService = fixedCostsService as unknown as {
      getCostos: ReturnType<typeof vi.fn>;
      setCostos: ReturnType<typeof vi.fn>;
    };
    controller = new FixedCostsController();
    vi.clearAllMocks();
  });

  describe("getCostos", () => {
    it("should return all fixed costs from service", () => {
      const expectedCostos = {
        banios: 250,
        desparasitacionesExterna: 250,
        desparasitacionesInterna: 250,
        vacunas: 250,
        kilometros: 50,
        honorario: 400,
      };

      mockService.getCostos.mockReturnValue(expectedCostos);

      const result = controller.getCostos();

      expect(mockService.getCostos).toHaveBeenCalled();
      expect(result).toEqual(expectedCostos);
    });

    it("should return updated costs after modification", () => {
      const updatedCostos = {
        banios: 300,
        desparasitacionesExterna: 275,
        desparasitacionesInterna: 260,
        vacunas: 280,
        kilometros: 60,
        honorario: 450,
      };

      mockService.getCostos.mockReturnValue(updatedCostos);

      const result = controller.getCostos();

      expect(result).toEqual(updatedCostos);
    });
  });

  describe("loadCostos", () => {
    it("should call service setCostos with provided data", async () => {
      const newCostos: UpdateFixedCostsDTO = {
        banios: 300,
        desparasitacionesExterna: 275,
        desparasitacionesInterna: 260,
        vacunas: 280,
        kilometros: 60,
        honorario: 450,
      };

      mockService.setCostos.mockResolvedValue(undefined);

      await controller.loadCostos(newCostos);

      expect(mockService.setCostos).toHaveBeenCalledWith(newCostos);
    });

    it("should handle partial updates", async () => {
      const partialCostos: UpdateFixedCostsDTO = {
        banios: 350,
        vacunas: 290,
      };

      mockService.setCostos.mockResolvedValue(undefined);

      await controller.loadCostos(partialCostos);

      expect(mockService.setCostos).toHaveBeenCalledWith(partialCostos);
    });

    it("should propagate errors from service", async () => {
      const newCostos: UpdateFixedCostsDTO = {
        banios: 300,
      };

      const error = new Error("File write error");
      mockService.setCostos.mockRejectedValue(error);

      await expect(controller.loadCostos(newCostos)).rejects.toThrow(
        "File write error"
      );
    });
  });
});
