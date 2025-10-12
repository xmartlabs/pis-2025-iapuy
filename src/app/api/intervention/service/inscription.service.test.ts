/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/app/models/usrperro.entity", () => {
  class UsrPerro {
    static findOne = vi.fn();
    constructor(public props: any) { Object.assign(this, props); }
    async save(): Promise<void> {
    }
  }
  return { UsrPerro };
});

vi.mock("@/app/models/acompania.entity", () => {
  class Acompania {
    static findOne = vi.fn();
    constructor(public props: any) { Object.assign(this, props); }
    async save(): Promise<void> {
    }
  }
  return { Acompania };
});

vi.mock("@/app/models/user.entity", () => ({ User: { findOne: vi.fn() } }));

vi.mock("@/app/models/perro.entity", () => ({ Perro: { findOne: vi.fn() } }));

import { InscripcionService } from "./inscription.service";
import { User } from "@/app/models/user.entity";
import { Perro } from "@/app/models/perro.entity";
import { UsrPerro } from "@/app/models/usrperro.entity";
import { Acompania } from "@/app/models/acompania.entity";

describe("InscripcionService.inscribirse", () => {
  const service = new InscripcionService();

  const baseDto = {
    ci: "12345678",
    intervencion: "INT-1",
    perro: "DOG-1",
    tipo: "guia" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register a guide with a dog successfully", async () => {
    (User.findOne as any).mockResolvedValue({ ci: baseDto.ci });
    (UsrPerro.findOne as any)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    (Acompania.findOne as any).mockResolvedValue(null);
    (Perro.findOne as any).mockResolvedValue({ id: baseDto.perro });

    const res = await service.inscribirse(baseDto);

    expect(res).toEqual({
      message: "Inscripción de guía con perro completada correctamente",
      status: 200,
    });
  });

  it("should register a companion without a dog successfully", async () => {
    const dto = { ...baseDto, tipo: "acompaniante" as const };
    (User.findOne as any).mockResolvedValue({ ci: dto.ci });
    (UsrPerro.findOne as any).mockResolvedValue(null);
    (Acompania.findOne as any).mockResolvedValue(null);

    const res = await service.inscribirse(dto);

    expect(res).toEqual({
      message: "Inscripción de acompañante completada correctamente",
      status: 200,
    });
  });

  it("should throw an error if the user is not found", async () => {
    (User.findOne as any).mockResolvedValue(null);
    await expect(service.inscribirse(baseDto)).rejects.toThrow("Usuario no encontrado");
  });

  it("should throw an error if the person already participates as guide", async () => {
    (User.findOne as any).mockResolvedValue({ ci: baseDto.ci });
    (UsrPerro.findOne as any).mockResolvedValueOnce({ id: "UP-1" });
    await expect(service.inscribirse(baseDto))
      .rejects.toThrow("La persona ya participa de la intervención");
  });

  it("should throw an error if the person already participates as companion", async () => {
    (User.findOne as any).mockResolvedValue({ ci: baseDto.ci });
    (UsrPerro.findOne as any).mockResolvedValueOnce(null);
    (Acompania.findOne as any).mockResolvedValueOnce({ id: "AC-1" });
    await expect(service.inscribirse(baseDto))
      .rejects.toThrow("La persona ya participa de la intervención");
  });

  it("should throw an error if the dog is not found for a guide", async () => {
    (User.findOne as any).mockResolvedValue({ ci: baseDto.ci });
    (UsrPerro.findOne as any).mockResolvedValueOnce(null);
    (Acompania.findOne as any).mockResolvedValue(null);
    (Perro.findOne as any).mockResolvedValue(null);

    await expect(service.inscribirse(baseDto))
      .rejects.toThrow("Perro no encontrado");
  });

  it("should throw an error if the dog already participates in the intervention", async () => {
    (User.findOne as any).mockResolvedValue({ ci: baseDto.ci });
    (UsrPerro.findOne as any).mockResolvedValueOnce(null);
    (Acompania.findOne as any).mockResolvedValue(null);
    (Perro.findOne as any).mockResolvedValue({ id: baseDto.perro });
    (UsrPerro.findOne as any).mockResolvedValueOnce({ id: "UP-DOG" });

    await expect(service.inscribirse(baseDto))
      .rejects.toThrow("El perro ya participa de la intervención");
  });

  it("should return 400 if the type is invalid", async () => {
    (User.findOne as any).mockResolvedValue({ ci: baseDto.ci });
    // @ts-expect-error forcing invalid type
    const res = await service.inscribirse({ ...baseDto, tipo: "invalid" });
    expect(res).toEqual({
      error: "Tipo de inscripción inválida",
      status: 400,
    });
  });

  it("should propagate save() error for guide", async () => {
    (User.findOne as any).mockResolvedValue({ ci: baseDto.ci });
    (UsrPerro.findOne as any).mockResolvedValueOnce(null);
    (Acompania.findOne as any).mockResolvedValue(null);
    (Perro.findOne as any).mockResolvedValue({ id: baseDto.perro });
    vi.spyOn(UsrPerro.prototype, "save").mockRejectedValue(new Error("Save failed"));

    await expect(service.inscribirse(baseDto))
      .rejects.toThrow("Save failed");
  });

  it("should propagate save() error for companion", async () => {
    const dto = { ...baseDto, tipo: "acompaniante" as const };
    (User.findOne as any).mockResolvedValue({ ci: dto.ci });
    (UsrPerro.findOne as any).mockResolvedValueOnce(null);
    (Acompania.findOne as any).mockResolvedValueOnce(null);
    vi.spyOn(Acompania.prototype, "save").mockRejectedValue(new Error("Save failed"));

    await expect(service.inscribirse(dto))
      .rejects.toThrow("Save failed");
  });
});
