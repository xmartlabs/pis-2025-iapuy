/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Institucion } from "@/app/models/institucion.entity";
import { InstitutionContact } from "@/app/models/institution-contact.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { InstitucionPatologias } from "@/app/models/intitucion-patalogia";
import { InstitutionsService } from "./instituciones.service";

vi.mock("@/app/models/institucion.entity", () => ({
  Institucion: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/app/models/institution-contact.entity", () => ({
  InstitutionContact: { create: vi.fn() },
}));
vi.mock("@/app/models/patologia.entity", () => ({
  Patologia: {
    findOrCreate: vi.fn().mockResolvedValue([
      { id: "mockPathologyId", nombre: "Some Pathology" }, // mock instance
      true, // "created" flag
    ]),
  },
}));
vi.mock("@/app/models/intitucion-patalogia", () => ({
  InstitucionPatologias: { findOrCreate: vi.fn() },
}));

describe("InstitutionService", () => {
  let service: any = undefined;

  beforeEach(() => {
    service = new InstitutionsService();
    vi.clearAllMocks();
  });

  const mockDTO = {
    name: "Hospital Central",
    institutionContacts: [
      { name: "Juan Pérez", contact: "099123123" },
      { name: "María Gómez", contact: "098456456" },
    ],
    pathologies: ["Diabetes", "Hipertensión"],
  };

  it("create should throw an error if institution already exists", async () => {
    (Institucion.findOne as any).mockResolvedValueOnce({
      id: 1,
      nombre: "Hospital Central",
    });
    const findOneSpy = vi.spyOn(Institucion, "findOne").mockResolvedValue(null);

    await expect(service.create(mockDTO)).rejects.toThrowError(
      "Ya existe una institucion con el nombre elegido."
    );

    expect(findOneSpy).toHaveBeenCalledWith({
      where: { nombre: mockDTO.name },
    });
  });
  it("creates institution, contacts, and pathologies successfully", async () => {
    (Institucion.findOne as any).mockResolvedValueOnce(null);
    (Institucion.create as any).mockResolvedValueOnce({
      id: "inst-1",
      nombre: mockDTO.name,
    });
    (InstitutionContact.create as any).mockResolvedValue();

    (InstitucionPatologias.findOrCreate as any).mockResolvedValue();
    const createInstitutionSpy = vi
      .spyOn(Institucion, "create")
      .mockResolvedValue(null);
    const createInstitutionContactSpy = vi
      .spyOn(InstitutionContact, "create")
      .mockResolvedValue(null);
    const findOrCreatePatologiaSpy = vi
      .spyOn(Patologia, "findOrCreate")
      .mockResolvedValue([
        { id: "mock-id", nombre: "Diabetes" } as Patologia, // mock instance
        true,
      ]);
    const findOrCreateInstitucionPatologiasSpy = vi
      .spyOn(InstitucionPatologias, "findOrCreate")
      .mockResolvedValue([
        {
          institucionId: "mock-institucion-id",
          patologiaId: "mock-patologia-id",
        } as InstitucionPatologias,
        true,
      ]);
    const result = await service.create(mockDTO);

    expect(createInstitutionSpy).toHaveBeenCalledWith({ nombre: mockDTO.name });
    expect(createInstitutionContactSpy).toHaveBeenCalledTimes(2);
    expect(findOrCreatePatologiaSpy).toHaveBeenCalledTimes(2);
    expect(findOrCreateInstitucionPatologiasSpy).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ id: "inst-1", nombre: mockDTO.name });
  });

  it("propagates errors if creation fails", async () => {
    (Institucion.findOne as any).mockResolvedValueOnce(null);
    (Institucion.create as any).mockRejectedValueOnce(new Error("DB failure"));

    await expect(service.create(mockDTO)).rejects.toThrowError("DB failure");
  });
});
