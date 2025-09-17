import { describe, it, expect, vi, beforeEach } from "vitest";
// Importa funciones de Vitest para definir y ejecutar tests.

import { UserService } from "./user.service";
// Importa la clase UserService que se va a testear.

import { User } from "@/app/models/user.entity";
// Importa el modelo User para poder mockear sus métodos.

vi.mock("@/app/models/user.entity", () => ({
  User: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
}));
// Mockea el modelo User y sus métodos principales para evitar llamadas reales a la base de datos.

vi.mock("../../../models/intervencion.entity", () => ({
  Intervencion: {},
}));
// Mockea el modelo Intervencion para evitar inicialización de Sequelize.

vi.mock("@/app/models/perro.entity", () => ({
  Perro: {},
}));
// Mockea el modelo Perro para evitar inicialización de Sequelize.

describe("UserService", () => {
  // Define el grupo de tests para UserService.
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    vi.clearAllMocks();
  });
  // Antes de cada test, crea una nueva instancia de UserService y limpia los mocks.

  it("findAll should return paginated users", async () => {
    (User.findAndCountAll as any).mockResolvedValue({ rows: [], count: 0 });
    // Simula que findAndCountAll retorna una lista vacía y un conteo de 0.
    const pagination = { query: "", size: 10, getOffset: () => 0, getOrder: () => [] };
    // Crea un objeto de paginación simulado.
    const result = await service.findAll(pagination as any);
    // Llama al método findAll del servicio.
    expect(User.findAndCountAll).toHaveBeenCalled();
    // Verifica que el método del modelo fue llamado.
    expect(result).toBeDefined();
    // Verifica que el resultado existe.
  });

  it("findOne should return a user", async () => {
    (User.findByPk as any).mockResolvedValue({ username: "test" });
    // Simula que findByPk retorna un usuario con username "test".
    const result = await service.findOne("test");
    // Llama al método findOne del servicio.
    expect(User.findByPk).toHaveBeenCalledWith("test");
    // Verifica que el método fue llamado con el argumento correcto.
    expect(result).toEqual({ username: "test" });
    // Verifica que el resultado es el esperado.
  });

  it("create should create a user", async () => {
    (User.create as any).mockResolvedValue({ username: "new" });
    // Simula que create retorna un usuario con username "new".
    const result = await service.create({ username: "new" } as any);
    // Llama al método create del servicio.
    expect(User.create).toHaveBeenCalled();
    // Verifica que el método fue llamado.
    expect(result).toEqual({ username: "new" });
    // Verifica que el resultado es el esperado.
  });

  it("delete should return true if deleted", async () => {
    (User.destroy as any).mockResolvedValue(1);
    // Simula que destroy elimina un usuario (retorna 1).
    const result = await service.delete("test");
    // Llama al método delete del servicio.
    expect(User.destroy).toHaveBeenCalledWith({ where: { username: "test" } });
    // Verifica que el método fue llamado con los argumentos correctos.
    expect(result).toBe(true);
    // Verifica que el resultado es true.
  });

  it("delete should return false if not deleted", async () => {
    (User.destroy as any).mockResolvedValue(0);
    // Simula que destroy no elimina ningún usuario (retorna 0).
    const result = await service.delete("test");
    // Llama al método delete del servicio.
    expect(result).toBe(false);
    // Verifica que el resultado es false.
  });
});