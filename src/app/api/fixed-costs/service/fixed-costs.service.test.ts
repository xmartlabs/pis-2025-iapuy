import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import type UpdateFixedCostsDTO from "../dtos/fixed-costs.dto";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

describe("FixedCostsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("init", () => {
    it("should load costs from file when file exists", async () => {
      const mockFileData = JSON.stringify({
        banios: 300,
        desparasitacionesInterna: 275,
        desparasitacionesExterna: 260,
        vacunas: 280,
        kilometros: 60,
        honorario: 450,
      });

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileData);

      const { fixedCostsService } = await import("./fixed-costs.service");

      const costos = fixedCostsService.getCostos();

      expect(costos).toEqual({
        banios: 300,
        desparasitacionesInterna: 275,
        desparasitacionesExterna: 260,
        vacunas: 280,
        kilometros: 60,
        honorario: 450,
      });
    });

    it("should create default file when file does not exist", async () => {
      (readFile as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("File not found")
      );
      (mkdir as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      (writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const { fixedCostsService } = await import("./fixed-costs.service");

      const costos = fixedCostsService.getCostos();

      expect(mkdir).toHaveBeenCalled();
      expect(writeFile).toHaveBeenCalled();
      expect(costos).toEqual({
        banios: 250,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 250,
        vacunas: 250,
        kilometros: 50,
        honorario: 400,
      });
    });
  });

  describe("individual getters", () => {
    it("should return correct cost for banio", async () => {
      const mockFileData = JSON.stringify({
        banios: 300,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 250,
        vacunas: 250,
        kilometros: 50,
        honorario: 400,
      });

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileData);

      const { fixedCostsService } = await import("./fixed-costs.service");

      expect(fixedCostsService.getCostoBanio()).toBe(300);
    });

    it("should return correct cost for desparasitacion interna", async () => {
      const mockFileData = JSON.stringify({
        banios: 250,
        desparasitacionesInterna: 275,
        desparasitacionesExterna: 250,
        vacunas: 250,
        kilometros: 50,
        honorario: 400,
      });

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileData);

      const { fixedCostsService } = await import("./fixed-costs.service");

      expect(fixedCostsService.getCostoDesparasitacionInterna()).toBe(275);
    });

    it("should return correct cost for desparasitacion externa", async () => {
      const mockFileData = JSON.stringify({
        banios: 250,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 260,
        vacunas: 250,
        kilometros: 50,
        honorario: 400,
      });

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileData);

      const { fixedCostsService } = await import("./fixed-costs.service");

      expect(fixedCostsService.getCostoDesparasitacionExterna()).toBe(260);
    });

    it("should return correct cost for vacunas", async () => {
      const mockFileData = JSON.stringify({
        banios: 250,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 250,
        vacunas: 280,
        kilometros: 50,
        honorario: 400,
      });

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileData);

      const { fixedCostsService } = await import("./fixed-costs.service");

      expect(fixedCostsService.getCostoVacunas()).toBe(280);
    });

    it("should return correct cost for kilometros", async () => {
      const mockFileData = JSON.stringify({
        banios: 250,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 250,
        vacunas: 250,
        kilometros: 60,
        honorario: 400,
      });

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileData);

      const { fixedCostsService } = await import("./fixed-costs.service");

      expect(fixedCostsService.getCostoKilometros()).toBe(60);
    });

    it("should return correct honorario", async () => {
      const mockFileData = JSON.stringify({
        banios: 250,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 250,
        vacunas: 250,
        kilometros: 50,
        honorario: 450,
      });

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileData);

      const { fixedCostsService } = await import("./fixed-costs.service");

      expect(fixedCostsService.getHonorario()).toBe(450);
    });
  });

  describe("setCostos", () => {
    it("should update all costs and write to file", async () => {
      const mockFileData = JSON.stringify({
        banios: 250,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 250,
        vacunas: 250,
        kilometros: 50,
        honorario: 400,
      });

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileData);
      (writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const { fixedCostsService } = await import("./fixed-costs.service");

      const newCostos: UpdateFixedCostsDTO = {
        banios: 300,
        desparasitacionesInterna: 275,
        desparasitacionesExterna: 260,
        vacunas: 280,
        kilometros: 60,
        honorario: 450,
      };

      await fixedCostsService.setCostos(newCostos);

      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining("costos.json"),
        expect.stringContaining('"banios": 300'),
        "utf-8"
      );

      const updatedCostos = fixedCostsService.getCostos();
      expect(updatedCostos).toEqual(newCostos);
    });

    it("should update only provided costs (partial update)", async () => {
      const mockFileData = JSON.stringify({
        banios: 250,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 250,
        vacunas: 250,
        kilometros: 50,
        honorario: 400,
      });

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileData);
      (writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const { fixedCostsService } = await import("./fixed-costs.service");

      const partialUpdate: UpdateFixedCostsDTO = {
        banios: 350,
        vacunas: 290,
      };

      await fixedCostsService.setCostos(partialUpdate);

      const updatedCostos = fixedCostsService.getCostos();
      expect(updatedCostos.banios).toBe(350);
      expect(updatedCostos.vacunas).toBe(290);
      expect(updatedCostos.desparasitacionesInterna).toBe(250);
      expect(updatedCostos.desparasitacionesExterna).toBe(250);
      expect(updatedCostos.kilometros).toBe(50);
      expect(updatedCostos.honorario).toBe(400);
    });

    it("should persist changes to file", async () => {
      const mockFileData = JSON.stringify({
        banios: 250,
        desparasitacionesInterna: 250,
        desparasitacionesExterna: 250,
        vacunas: 250,
        kilometros: 50,
        honorario: 400,
      });

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileData);
      (writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const { fixedCostsService } = await import("./fixed-costs.service");

      const newCostos: UpdateFixedCostsDTO = {
        banios: 300,
      };

      await fixedCostsService.setCostos(newCostos);

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "utf-8"
      );
    });
  });
});
