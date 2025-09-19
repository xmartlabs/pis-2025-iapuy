import { describe, it, expect, vi, beforeEach } from "vitest";
import { PerrosService } from "@/app/api/perros/service/perros.service";
import { Perro } from "@/app/models/perro.entity";

// Mock de Sequelize models
vi.mock("@/app/models/perro.entity", () => ({
  Perro: {
    findAndCountAll: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/app/models/user.entity", () => ({
  User: {},
}));

// Mock de la función de transformación de paginación
vi.mock("@/lib/pagination/transform", () => ({
  getPaginationResultFromModel: vi.fn().mockImplementation((pagination, result) => ({
    data: result.rows,
    total: result.count,
    size: pagination.size,
  })),
}));

describe("PerrosService", () => {
  let service: PerrosService;

  beforeEach(() => {
    service = new PerrosService();
    vi.clearAllMocks();
  });

  it("findAll debería devolver perros paginados", async () => {
    (Perro.findAndCountAll as any).mockResolvedValue({
      rows: [{ id: 1, nombre: "Firulais" }],
      count: 1,
    });

    const pagination = { query: "Firu", size: 10, getOffset: () => 0, getOrder: () => [] };

    const result = await service.findAll(pagination as any);

    expect(Perro.findAndCountAll).toHaveBeenCalled();
    expect(result.data[0].nombre).toBe("Firulais");
    expect(result.total).toBe(1);
  });

  it("create debería crear un perro", async () => {
    (Perro.create as any).mockResolvedValue({ id: 2, nombre: "Lassie" });

    const result = await service.create({
      nombre: "Lassie",
      descripcion: "Collie",
      fortalezas: "Inteligente",
      duenioId: "123",
    });

    expect(Perro.create).toHaveBeenCalled();
    expect(result.nombre).toBe("Lassie");
  });
});
