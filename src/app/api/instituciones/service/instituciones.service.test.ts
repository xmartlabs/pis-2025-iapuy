import { describe, it, expect, vi, beforeEach } from "vitest";
import { InstitucionesService } from "./instituciones.service";

vi.mock("@/app/models/institucion.entity", () => ({
  Institucion: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/app/models/institution-contact.entity", () => ({
  InstitutionContact: {
    create: vi.fn(),
  },
}));

vi.mock("@/app/models/patologia.entity", () => ({
  Patologia: {
    findOrCreate: vi.fn(),
  },
}));

vi.mock("@/app/models/intitucion-patalogia.entity", () => ({
  InstitucionPatologias: {
    findOrCreate: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock("@/app/models/institucion-intervenciones.entity", () => ({
  InstitucionIntervencion: {
    findOrCreate: vi.fn(),
  },
}));

vi.mock("@/lib/database", () => ({
  default: {
    // eslint-disable-next-line arrow-body-style
    transaction: vi.fn(async (callback: (t: unknown) => Promise<unknown>) => {
      return await callback({});
    }),
  },
}));

import { Institucion } from "@/app/models/institucion.entity";
import { InstitutionContact } from "@/app/models/institution-contact.entity";
import { Patologia } from "@/app/models/patologia.entity";
import { InstitucionPatologias } from "@/app/models/intitucion-patalogia.entity";

describe("InstitucionesService", () => {
  // eslint-disable-next-line init-declarations
  let service: InstitucionesService;

  beforeEach(() => {
    service = new InstitucionesService();
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

  it("debería lanzar error si la institución ya existe", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Institucion.findOne).mockResolvedValueOnce({
      id: 1,
      nombre: "Hospital Central",
    } as never);

    await expect(service.create(mockDTO)).rejects.toThrowError(
      "Ya existe una institucion con el nombre elegido.",
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Institucion.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { nombre: mockDTO.name },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        transaction: expect.any(Object),
      }),
    );
  });

  it("debería crear institución, contactos y patologías correctamente", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Institucion.findOne).mockResolvedValueOnce(null as never);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Institucion.create).mockResolvedValueOnce({
      id: "inst-1",
      nombre: mockDTO.name,
    } as never);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(InstitutionContact.create).mockResolvedValue({} as never);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Patologia.findOrCreate).mockResolvedValue([
      { id: "mock-id", nombre: "Diabetes" },
      true,
    ] as never);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(InstitucionPatologias.findOrCreate).mockResolvedValue([
      { institucionId: "inst-1", patologiaId: "mock-id" },
      true,
    ] as never);

    const result = await service.create(mockDTO);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Institucion.create).toHaveBeenCalledWith(
      { nombre: mockDTO.name },
      expect.anything(),
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(InstitutionContact.create).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Patologia.findOrCreate).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(InstitucionPatologias.findOrCreate).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ id: "inst-1", nombre: mockDTO.name });
  });

  it("debería propagar errores si falla la creación", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Institucion.findOne).mockResolvedValueOnce(null as never);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Institucion.create).mockRejectedValueOnce(
      new Error("DB failure"),
    );

    await expect(service.create(mockDTO)).rejects.toThrowError("DB failure");
  });
});
