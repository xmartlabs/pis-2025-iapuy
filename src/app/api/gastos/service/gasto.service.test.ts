import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/app/models/gastos.entity", () => ({
  Gasto: {
    findByPk: vi.fn(),
  },
}));
vi.mock("@/app/models/user.entity", () => ({ User: {} }));
vi.mock("@/app/models/intervention.entity", () => ({ Intervention: {} }));

describe("GastoService.update", () => {
  let service: {
    update: (
      id: string,
      data: Partial<Record<string, unknown>>
    ) => Promise<unknown>;
  } | null = null;
  let GastoMock: {
    findByPk: (identifier?: unknown, options?: unknown) => Promise<unknown>;
  } | null = null;

  beforeEach(async () => {
    vi.clearAllMocks();
    GastoMock = (await import("@/app/models/gastos.entity"))
      .Gasto as unknown as {
      findByPk: (identifier?: unknown, options?: unknown) => Promise<unknown>;
    };
    const mod = await import("./gasto.service");
    service = new mod.GastoService() as unknown as {
      update: (
        id: string,
        data: Partial<Record<string, unknown>>
      ) => Promise<unknown>;
    };
  });

  it("returns null when gasto not found", async () => {
    const spy = vi.spyOn(GastoMock, "findByPk").mockResolvedValue(null);

    const res = await service!.update("1", { monto: 100 } as Partial<
      Record<string, unknown>
    >);

    expect(spy).toHaveBeenCalledWith("1");
    expect(res).toBeNull();
  });

  it("parses string monto to number and updates", async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ id: "1", monto: 123 });
    const mockGasto = { update: mockUpdate };
    const spy = vi
      .spyOn(GastoMock, "findByPk")
      .mockResolvedValue(mockGasto as unknown as Promise<unknown>);

    const res = await service!.update("1", { monto: "123" } as Partial<
      Record<string, unknown>
    >);

    expect(spy).toHaveBeenCalledWith("1");
    expect(mockUpdate).toHaveBeenCalled();
    expect(res).toEqual({ id: "1", monto: 123 });
  });

  it("keeps invalid string monto and updates with original value", async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ id: "1", monto: "abc" });
    const mockGasto = { update: mockUpdate };
    const spy = vi
      .spyOn(GastoMock, "findByPk")
      .mockResolvedValue(mockGasto as unknown as Promise<unknown>);

    const res = await service!.update("1", { monto: "abc" } as Partial<
      Record<string, unknown>
    >);

    expect(spy).toHaveBeenCalledWith("1");
    expect(mockUpdate).toHaveBeenCalledWith({ monto: "abc" });
    expect(res).toEqual({ id: "1", monto: "abc" });
  });

  it("updates when monto is numeric", async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ id: "1", monto: 50 });
    const mockGasto = { update: mockUpdate };
    const spy = vi
      .spyOn(GastoMock, "findByPk")
      .mockResolvedValue(mockGasto as unknown as Promise<unknown>);

    const res = await service!.update("1", { monto: 50 } as Partial<
      Record<string, unknown>
    >);

    expect(spy).toHaveBeenCalledWith("1");
    expect(mockUpdate).toHaveBeenCalledWith({ monto: 50 });
    expect(res).toEqual({ id: "1", monto: 50 });
  });
});
