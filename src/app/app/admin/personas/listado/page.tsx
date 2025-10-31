"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { PersonStanding, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { LoginContext } from "@/app/context/login-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import CustomPagination from "@/app/components/pagination";
import CustomSearchBar from "@/app/components/search-bar";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

type PerroSummary = { id?: string; nombre?: string };
type UserRowBase = {
  [key: string]: string | number | boolean | null | undefined;
};
type UserRow = UserRowBase & { perros?: PerroSummary[] };

export default function ListadoPersonas() {
  const [loading, setLoading] = useState<boolean>(true);
  const context = useContext(LoginContext)!;
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const router = useRouter();

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Resetear a primera página al buscar
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  const fetchUsers = useCallback(
    async (
      pageNum: number,
      pageSize: number,
      signal?: AbortSignal
    ): Promise<PaginationResultDto<UserRow> | null> => {
      const p = Math.max(1, Math.trunc(Number(pageNum) || 1));
      const s = Math.max(1, Math.min(100, Math.trunc(Number(pageSize) || 12)));

      const qs = new URLSearchParams();
      qs.set("page", String(p));
      qs.set("size", String(s));
      qs.set("query", String(search));
      const url = `/api/users?${qs.toString()}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => { controller.abort(); }, 10000);
      const combinedSignal = signal ?? controller.signal;

      try {
        const resp = await fetchWithAuth(context, url.toString(), {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: combinedSignal,
        });

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(
            `API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`
          );
        }

        const ct = resp.headers.get("content-type") ?? "";
        if (!ct.includes("application/json"))
          throw new Error("Expected JSON response");

        const body = (await resp.json()) as unknown;
        if (
          !body ||
          typeof body !== "object" ||
          !Array.isArray((body as PaginationResultDto<UserRow>).data)
        )
          throw new Error("Malformed API response");

        return body as PaginationResultDto<UserRow>;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") return null;
        return null;
      } finally {
        clearTimeout(timeout);
      }
    },
    [context, search]
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchUsers(page, size, controller.signal)
      .then((res) => {
        if (res) {
          setUsers(res.data);
          setTotalPages(res.totalPages ?? 1);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, size, search, fetchUsers]);

  const columnToAttribute: Record<string, string> = {
    Nombre: "nombre",
    "Cédula de identidad": "ci",
    Celular: "celular",
    Banco: "banco",
    "Número de Cuenta": "cuentaBancaria",
  };
  const columnHeader: string[] = [
    "Nombre",
    "Cédula de identidad",
    "Celular",
    "Banco",
    "Número de Cuenta",
    "Perro",
  ];
  return (
    <div className=" max-w-[95%] p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="w-full h-[48px] flex justify-between opacity-100 mb-[32px]">
          <div className="flex items-center gap-3">
            <PersonStanding className="h-[46px] w-[46px] text-[rgba(0, 0, 0, 1)]" />
            <h1 className="font-serif font-semibold text-5xl leading-[100%] tracking-[-2.5%] align-middle">
              Personas
            </h1>
          </div>
          <Button
            asChild
            className="ml-4 text-sm leading-6 medium !bg-[var(--custom-green)] !text-white w-full sm:w-auto"
          >
            <span className="flex items-center justify-center sm:justify-start">
              <Plus className="mr-2" />
              <Link href="/app/admin/personas/nueva">Agregar Persona</Link>
            </span>
          </Button>
        </div>
      </div>

      <div className="flex justify-start sm:justify-end items-center">
        <CustomSearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />
      </div>
      <div className=" mx-auto w-full border border-gray-300 mt-4 rounded-lg">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                {columnHeader.map((head, index) => (
                  <TableHead
                    key={head}
                    className={`text-sm font-medium sm:w-[186px] leading-6 medium h-[56px] px-2 sm:px-4 ${
                      index >= 3 && head !== "Perro"
                        ? "hidden sm:table-cell"
                        : ""
                    }`}
                  >
                    {head === "Cédula de identidad" ? (
                      <span className="sm:hidden">C.I</span>
                    ) : (
                      head
                    )}
                    {head === "Cédula de identidad" && (
                      <span className="hidden sm:inline">
                        Cédula de Identidad
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="px-6 py-4">
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[160px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[110px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[48px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users && users.length > 0 ? (
                users.map((user, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => {
                      // eslint-disable-next-line @typescript-eslint/no-floating-promises
                      router.push(`/app/admin/personas/detalle?ci=${user.ci}`);
                    }}
                  >
                    {Object.keys(columnToAttribute).map((column, index) => {
                      const attribute = columnToAttribute[column];
                      const value = user[attribute];
                      return (
                        <TableCell
                          key={column}
                          className={`h-[48px] px-2 sm:px-4 sm:w-[186px] ${
                            index >= 3 ? "hidden sm:table-cell" : ""
                          }`}
                        >
                          <div
                            className="truncate"
                            title={
                              value === null || value === undefined
                                ? ""
                                : String(value)
                            }
                          >
                            {value === null || value === undefined
                              ? ""
                              : String(value)}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell
                      key="perros"
                      className="h-[48px] px-2 sm:px-4 sm:w-[186px]"
                    >
                      <div className="truncate">
                        {Array.isArray(user.perros) && user.perros.length > 0
                          ? user.perros.map((p, index) =>
                              p?.nombre ? (
                                <Link
                                  key={index}
                                  href={`/app/admin/perros/detalles?id=${p.id}`}
                                  className="!underline hover:text-blue-800 mr-2 text-sm"
                                >
                                  {p.nombre}
                                </Link>
                              ) : null
                            )
                          : "No tiene"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {"No hay datos disponibles"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <CustomPagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
