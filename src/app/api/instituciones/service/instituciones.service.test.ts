/* eslint-disable */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { InstitucionesService } from "./instituciones.service";

vi.mock("@/app/models/institucion.entity", () => ({
  Institucion: {
    findOne: vi.fn(),
    findByPk: vi.fn(),
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
    destroy: vi.fn(),
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
    destroy: vi.fn(),
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

// Mock pdf-lib to avoid heavy PDF operations in tests
vi.mock("pdf-lib", () => ({
  PDFDocument: {
    create: vi.fn(() => {
      const page = {
        getSize: () => ({ width: 612, height: 792 }),
        drawText: vi.fn(),
        drawImage: vi.fn(),
        drawSvgPath: vi.fn(),
      };
      const pdf = {
        addPage: vi.fn().mockReturnValue(page),
        embedFont: vi.fn().mockResolvedValue({ widthOfTextAtSize: () => 10 }),
        embedPng: vi.fn().mockResolvedValue({ scale: () => ({ width: 10, height: 10 }) }),
        save: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      };
      return pdf;
    }),
  },
  StandardFonts: { Helvetica: "Helvetica" },
  rgb: (_r: number, _g: number, _b: number) => ({ r: _r, g: _g, b: _b }),
}));

// Stub fs.existsSync to false so interventionsPDF falls back to title path
vi.mock("fs", () => ({
  existsSync: vi.fn(() => false),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
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

  it("findAllSimple maps id and name correctly", async () => {
    (Institucion.findAll as any).mockResolvedValue([{ id: "i1", nombre: "InstX" }]);
    const res = await service.findAllSimple();
    expect(res).toEqual([{ id: "i1", name: "InstX" }]);
  });

  describe("delete", () => {
    it("deletes successfully when found", async () => {
      (Institucion.destroy as any).mockResolvedValue(1);
      await expect(service.delete("i1")).resolves.toBeUndefined();
      expect(Institucion.destroy).toHaveBeenCalledWith({ where: { id: "i1" } });
    });

    it("throws when not found", async () => {
      (Institucion.destroy as any).mockResolvedValue(0);
      await expect(service.delete("i2")).rejects.toThrow(/Institution not found/);
    });
  });

  describe("update", () => {
    it("throws when institution not found", async () => {
      vi.mocked(Institucion.findByPk).mockResolvedValue(null as never);
      await expect(service.update("nope", { name: "X", institutionContacts: [], pathologies: [] } as any)).rejects.toThrow(/Institution not found/);
    });

    it("updates institution and replaces contacts and pathologies", async () => {
      const fakeInstitution: any = { id: "inst-1", nombre: "Old", update: vi.fn().mockResolvedValue({ id: "inst-1", nombre: "New" }) };
        vi.mocked(Institucion.findByPk).mockResolvedValue(fakeInstitution as never);
        vi.mocked(Institucion.findOne).mockResolvedValue(null as never);
        vi.mocked(InstitutionContact.destroy).mockResolvedValue(1 as never);
        vi.mocked(InstitutionContact.bulkCreate).mockResolvedValue([] as never);
        vi.mocked(InstitucionPatologias.destroy).mockResolvedValue(1 as never);
        vi.mocked(InstitucionPatologias.bulkCreate).mockResolvedValue([] as never);
        // Patologia lookups: first call returns empty (no existing), second returns created pathologies
        // Ensure Patologia.findAll returns a usable array for update flow
        vi.mocked(Patologia.findAll).mockResolvedValue([{ id: "pat-1", nombre: "P1" }] as never);
        vi.mocked(Patologia.bulkCreate).mockResolvedValue([] as never);

      const res = await service.update("inst-1", { name: "New", institutionContacts: [{ name: "A", contact: "1" }], pathologies: ["P1"] } as any);
      expect(fakeInstitution.update).toHaveBeenCalledWith({ nombre: "New" }, expect.anything());
      expect(InstitutionContact.destroy).toHaveBeenCalledWith({ where: { institutionId: "inst-1" }, transaction: expect.anything() });
      expect(InstitucionPatologias.destroy).toHaveBeenCalledWith({ where: { institucionId: "inst-1" }, transaction: expect.anything() });
      expect(res).toEqual({ id: "inst-1", nombre: "New" });
    });
  });

  it("interventionsPDF returns bytes even when logo missing", async () => {
    // return a minimal intervention entry
    vi.mocked(Intervention.findAll).mockResolvedValueOnce([
      {
        timeStamp: new Date(),
        UsrPerroIntervention: [],
        Pacientes: [],
      },
    ] as never);

    const bytes = await service.interventionsPDF("inst-1", []);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);
  });
});
