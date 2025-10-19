import { describe, it, expect, vi, beforeEach } from "vitest";
import { InscripcionService } from "./inscription.service";
import sequelize from "@/lib/database";
import { UsrPerro } from "@/app/models/usrperro.entity";
import { Acompania } from "@/app/models/acompania.entity";
import { User } from "@/app/models/user.entity";
import { Perro } from "@/app/models/perro.entity";
import { Intervention } from "@/app/models/intervention.entity";
import type { InscripcionDto } from "../dtos/inscription.dto";

// ---------------------- Mocks ----------------------
vi.mock("@/app/models/usrperro.entity", () => ({
  UsrPerro: {
    create: vi.fn(),
    some: vi.fn(),
  },
}));
vi.mock("@/app/models/acompania.entity", () => ({
  Acompania: {
    create: vi.fn(),
    some: vi.fn(),
  },
}));
vi.mock("@/app/models/user.entity", () => ({
  User: {
    findOne: vi.fn(),
  },
}));
vi.mock("@/app/models/perro.entity", () => ({
  Perro: {
    findOne: vi.fn(),
  },
}));
vi.mock("@/app/models/intervention", () => ({
  Intervention: {
    findOne: vi.fn(),
  },
}));
vi.mock('@/lib/database', () => ({
    default: {
      transaction: vi.fn().mockResolvedValue({
        commit: vi.fn().mockResolvedValue(undefined),
        rollback: vi.fn().mockResolvedValue(undefined),
      }),
    },
}));

describe("InscriptionService", ()=>{
  // eslint-disable-next-line init-declarations
  let service: InscripcionService;

  beforeEach(() => {
    service = new InscripcionService();
    vi.clearAllMocks();
  })

  it("should register one companion", async () => {
    Intervention.findOne = vi.fn().mockResolvedValue({ id: "INT-1" });
    User.findOne = vi.fn().mockResolvedValue({ id: "USR-1" });
    
    const dto: InscripcionDto = {
      intervention: 'INT-1',
      acompaniantes: ['USR-1'],
      duplas: [],
    }
     const result = await service.inscribirse(dto);
     expect(result).toEqual({message: "Inscripciones realizadas con éxito.", status: 200});
  });

  it("should register one guide with dog", async () => {
    Intervention.findOne = vi.fn().mockResolvedValue({ id: "INT-1" });
    User.findOne = vi.fn().mockResolvedValue({ id: "USR-1" });
    Perro.findOne = vi.fn().mockResolvedValue({ id: "DOG-1" });
    
    const dto: InscripcionDto = {
      intervention: 'INT-1',
      acompaniantes: [],
      duplas: [{ ci: "USR-1", perro: "DOG-1" }],
    }
     const result = await service.inscribirse(dto);
     expect(result).toEqual({message: "Inscripciones realizadas con éxito.", status: 200});
  });
});