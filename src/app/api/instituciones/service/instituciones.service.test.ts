import { describe, it, expect, vi, beforeEach } from "vitest";
import { InstitucionesService } from "./instituciones.service";

vi.mock("@/app/models/institucion.entity", () => ({
  Institucion: {
    findOne: vi.fn(),
    create: vi.fn(),
    findAndCountAll: vi.fn(),
    destroy: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock("@/app/models/intervention.entity", () => ({
  Intervention: {
    findOne: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: vi.fn(
    (
      pagination: { page: number; size: number },
      result: { rows: unknown[]; count: number }
    ) => ({
      data: result.rows,
      count: result.rows.length,
      totalItems: result.count,
      totalPages: Math.ceil(result.count / pagination.size),
      page: pagination.page,
      size: pagination.size,
    })
  ),
}));

vi.mock("@/app/models/institution-contact.entity", () => ({
  InstitutionContact: {
    create: vi.fn(),
    bulkCreate: vi.fn(),
  },
}));

vi.mock("@/app/models/patologia.entity", () => ({
  Patologia: {
    findOrCreate: vi.fn(),
    findAll: vi.fn(),
    bulkCreate: vi.fn(),
  },
}));

vi.mock("@/app/models/intitucion-patalogia.entity", () => ({
  InstitucionPatologias: {
    findOrCreate: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
    bulkCreate: vi.fn(),
  },
}));

vi.mock("@/app/models/institucion-intervenciones.entity", () => ({
  InstitucionIntervencion: {
    findOrCreate: vi.fn(),
  },
}));

vi.mock("@/app/models/usrperro.entity", () => ({
  UsrPerro: {
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
import { Intervention } from "@/app/models/intervention.entity";

describe("InstitucionesService", () => {
  // eslint-disable-next-line init-declarations
  let service: InstitucionesService;

  beforeEach(() => {
    service = new InstitucionesService();
    vi.clearAllMocks();
  });

  describe("findOne", () => {
    it("debería retornar una institución si la encuentra", async () => {
      const mockInstitution = { id: "1", nombre: "Hospital" };
      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(Institucion.findOne).mockResolvedValue(
        mockInstitution as never
      );

      const result = await service.findOne("1");

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(Institucion.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        include: [
          {
            model: Patologia,
            as: "Patologias",
            attributes: ["id", "nombre"],
            through: { attributes: [] },
          },
          {
            model: InstitutionContact,
            as: "InstitutionContacts",
            attributes: ["id", "name", "contact"],
          },
        ],
      });
      expect(result).toEqual(mockInstitution);
    });

    it("debería retornar null si no encuentra la institución", async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(Institucion.findOne).mockResolvedValue(null as never);

      const result = await service.findOne("1");

      expect(result).toBeNull();
    });
  });

  describe("findInterventions", () => {
    it("debería retornar intervenciones paginadas", async () => {
      const mockInterventions = [{ id: "1" }, { id: "2" }];
      const mockCount = 2;
      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(Intervention.count).mockResolvedValue(mockCount);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(Intervention.findAll).mockResolvedValue(
        mockInterventions as never
      );

      const pagination = {
        page: 1,
        size: 10,
        query: "",
        getOffset: () => 0,
        getOrder: () => [],
      };
      const result = await service.findInterventions("1", [], pagination);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(Intervention.count).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(Intervention.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockInterventions,
        count: 2,
        totalItems: 2,
        totalPages: 1,
        page: 1,
        size: 10,
      });
    });
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
      "Ya existe una institucion con el nombre elegido."
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Institucion.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { nombre: mockDTO.name },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        transaction: expect.any(Object),
      })
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
    vi.mocked(InstitutionContact.bulkCreate).mockResolvedValue([] as never);
    
    // First call to Patologia.findAll (checking existing) returns empty
    // Second call to Patologia.findAll (after bulkCreate) returns the created pathologies
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Patologia.findAll)
      .mockResolvedValueOnce([] as never) // First call: no existing pathologies
      .mockResolvedValueOnce([ // Second call: return all pathologies
        { id: "pat-1", nombre: "Diabetes" },
        { id: "pat-2", nombre: "Hipertensión" }
      ] as never);
    
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Patologia.bulkCreate).mockResolvedValue([] as never);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Patologia.findOrCreate).mockResolvedValue([
      { id: "mock-id", nombre: "Diabetes" },
      true,
    ] as never);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(InstitucionPatologias.findAll).mockResolvedValue([] as never);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(InstitucionPatologias.bulkCreate).mockResolvedValue([] as never);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(InstitucionPatologias.findOrCreate).mockResolvedValue([
      { institucionId: "inst-1", patologiaId: "mock-id" },
      true,
    ] as never);

    const result = await service.create(mockDTO);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Institucion.create).toHaveBeenCalledWith(
      { nombre: mockDTO.name },
      expect.anything()
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(InstitutionContact.bulkCreate).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(Patologia.findOrCreate).toHaveBeenCalledTimes(0);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(InstitucionPatologias.bulkCreate).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: "inst-1", nombre: mockDTO.name });
  });

  it("debería propagar errores si falla la creación", async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Institucion.findOne).mockResolvedValueOnce(null as never);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(Institucion.create).mockRejectedValueOnce(
      new Error("DB failure")
    );

    await expect(service.create(mockDTO)).rejects.toThrowError("DB failure");
  });
});
