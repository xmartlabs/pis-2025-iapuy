/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    bulkCreate: vi.fn(),
  },
}));
vi.mock("@/app/models/acompania.entity", () => ({
  Acompania: {
    create: vi.fn(),
    bulkCreate: vi.fn(),
  },
}));
vi.mock("@/app/models/user.entity", () => ({
  User: {
    findOne: vi.fn(),
    findAll: vi.fn(),
  },
}));
vi.mock("@/app/models/perro.entity", () => ({
  Perro: {
    findOne: vi.fn(),
    findAll: vi.fn(),
    some: vi.fn(),
  },
}));
vi.mock("@/app/models/intervention.entity", () => ({
  Intervention: {
    findOne: vi.fn(),
    update: vi.fn(),
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

  function getInValues(obj: any) {
    const sym = Object.getOwnPropertySymbols(obj).find(s => String(s).includes('Symbol(in)'));
    return sym ? obj[sym] : undefined;
  }

  beforeEach(() => {
    service = new InscripcionService();
  })

  vi.spyOn(Intervention, 'findOne').mockImplementation((args: any) => {
      const { where: { id } } = args;

      if (id === 'INT-1') {
        return {
          id,
          pairsQuantity: 2,
          UsrPerroIntervention: [],
          Acompania: [],
        } as any;
      }

      return null; 
    });

    vi.spyOn(User, 'findAll').mockImplementation((args: any) => {
      const inVals = getInValues(args.where.ci);
      return (inVals ?? []).map((ci: string) => ({ ci }));
    });

    vi.spyOn(Perro, 'findAll').mockImplementation((args: any) => {
      const inVals = getInValues(args.where.id);
      return (inVals ?? []).map((id: number) => ({ id }));
    });

  it("should register one companion", async () => {
    const dto: InscripcionDto = {
      intervention: 'INT-1',
      acompaniantes: ['USR-1'],
      duplas: [],
    }
     const result = await service.inscribirse(dto);
     expect(result).toEqual({message: "Inscripciones realizadas con éxito.", status: 200});
  });

  it("should register one guide with dog", async () => {
    const dto: InscripcionDto = {
      intervention: 'INT-1',
      acompaniantes: [],
      duplas: [{ ci: "USR-1", perro: "DOG-1" }],
    }
     const result = await service.inscribirse(dto);
     expect(result).toEqual({message: "Inscripciones realizadas con éxito.", status: 200});
  });
});