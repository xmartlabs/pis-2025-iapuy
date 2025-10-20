"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";
import { Dog, Plus } from "lucide-react";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { LoginContext } from "@/app/context/login-context";
import { RegistrarPerro } from "./registrar-perro";
import { useRouter } from "next/navigation";
import type { PerroDTO } from "./DTOS/perro.dto";
import CustomPagination from "@/app/components/pagination";
import CustomSearchBar from "@/app/components/search-bar";
import { Button } from "@/components/ui/button";

export default function ListadoPerrosTable() {
  const [perros, setPerros] = useState<PerroDTO[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [reload, setReload] = useState(false);
  const [open, setOpen] = useState(false);

  const context = useContext(LoginContext);
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

  function go(id: string) {
    router.push(`/app/admin/perros/detalles?id=${id}`);
  }

  const fetchPerros = useCallback(
    async (
      pageNum: number,
      pageSize: number,
      query?: string,
      signal?: AbortSignal,
      triedRefresh = false
    ): Promise<PaginationResultDto<PerroDTO> | null> => {
      const p = Math.max(1, Math.trunc(Number(pageNum) || 1));
      const s = Math.max(1, Math.min(100, Math.trunc(Number(pageSize) || 12)));

      const qs = new URLSearchParams();
      qs.set("page", String(p));
      qs.set("size", String(s));
      if (query?.trim().length) qs.set("query", query.trim());
      const url = `/api/perros?${qs.toString()}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);
      const combinedSignal = signal ?? controller.signal;

      try {
        const token = context?.tokenJwt;
        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const resp = await fetch(url.toString(), {
          method: "GET",
          headers: baseHeaders,
          signal: combinedSignal,
        });

        if (!resp.ok && !triedRefresh && resp.status === 401) {
          const resp2 = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { Accept: "application/json" },
            signal: combinedSignal,
          });

          if (resp2.ok) {
            const refreshBody = (await resp2.json().catch(() => null)) as {
              accessToken?: string;
            } | null;

            const newToken = refreshBody?.accessToken ?? null;
            if (newToken) {
              context?.setToken(newToken);
              const retryResp = await fetch(url.toString(), {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
                signal: combinedSignal,
              });

              if (!retryResp.ok) {
                const txt = await retryResp.text().catch(() => "");
                throw new Error(
                  `API ${retryResp.status}: ${retryResp.statusText}${
                    txt ? ` - ${txt}` : ""
                  }`
                );
              }

              const ct2 = retryResp.headers.get("content-type") ?? "";
              if (!ct2.includes("application/json"))
                throw new Error("Expected JSON response");

              const body2 = (await retryResp.json()) as unknown;
              if (
                !body2 ||
                typeof body2 !== "object" ||
                !Array.isArray((body2 as PaginationResultDto<PerroDTO>).data)
              )
                throw new Error("Malformed API response");

              return body2 as PaginationResultDto<PerroDTO>;
            }
          }
        }

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
          !Array.isArray((body as PaginationResultDto<PerroDTO>).data)
        )
          throw new Error("Malformed API response");

        return body as PaginationResultDto<PerroDTO>;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") {
          return null;
        }
        // you were swallowing errors and returning null — keep that behaviour
        return null;
      } finally {
        clearTimeout(timeout);
      }
    },
    [context]
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchPerros(page, size, search, controller.signal)
      .then((res) => {
        if (res) {
          setPerros(res.data);
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
  }, [page, size, search, reload, fetchPerros]);

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("es-ES");
    } catch {
      return iso;
    }
  };

  return (
    <div className=" max-w-[95%] p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="w-full h-[48px] flex justify-between opacity-100 mb-[32px]">
          <div className="flex items-center gap-3">
            <Dog className="h-[46px] w-[46px] text-[rgba(0, 0, 0, 1)]" />
            <h1 className="font-serif font-semibold text-5xl leading-[100%] tracking-[-2.5%] align-middle">
              Perros
            </h1>
          </div>
          <Button
            className="w-[139px] h-10 min-w-[80px] rounded-md flex 
                      items-center justify-center gap-1 p-2.5 bg-[#5B9B40]
                      font-sans font-medium text-sm leading-6 text-[#EFF5EC]"
            onClick={(e) => {
              e.preventDefault();
              setOpen(true);
            }}
          >
            <Plus size={16} />
            Agregar perro
          </Button>
        </div>
      </div>
      <div>
        <div className="flex justify-start sm:justify-end items-center">
          <CustomSearchBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
          <RegistrarPerro
            reload={reload}
            setReload={setReload}
            open={open}
            setOpen={setOpen}
          />
        </div>
        <div className="mx-auto w-full border border-gray-300 mt-4 rounded-lg">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-full table-fixed border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200 -mt-px">
                  <TableHead className="w-[240px] px-6 py-3 text-left text-sm font-medium text-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
                    Nombre
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
                    Dueño
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
                    Última vacunación
                  </TableHead>
                  <TableHead className="px-6 py-3 text-center text-sm font-medium text-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
                    Intervenciones este mes
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 bg-white">
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
                ) : perros.length > 0 ? (
                  perros.map((p) => (
                    <TableRow
                      key={p.id}
                      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => {
                        go(p.id);
                      }}
                    >
                      <TableCell className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <span className="text-base md:text-base ml-2">
                            {p.nombre}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          {p.User?.nombre ?? p.duenioId ?? "-"}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          {p.RegistroSanidad &&
                          p.RegistroSanidad.Vacunas &&
                          p.RegistroSanidad.Vacunas.length > 0 &&
                          p.RegistroSanidad.Vacunas[0].fecha
                            ? formatDate(p.RegistroSanidad.Vacunas[0].fecha)
                            : "N/A"}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-center align-middle">
                        {Number(p.intervencionCount) || 0}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-36 px-6 py-8 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Dog className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {search
                            ? `Intenta ajustar los términos de búsqueda: "${search}"`
                            : "Intenta agregar un nuevo perro"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
