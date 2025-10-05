"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import CustomSearchBar from "@/app/components/search-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import CustomPagination from "@/app/components/pagination";

import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus } from "lucide-react";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { LoginContext } from "@/app/context/login-context";
import { useRouter } from "next/navigation";
import type { InterventionDto } from "@/app/app/admin/intervenciones/dtos/intervention.dto";
import { Button } from "@/components/ui/button";
import FilterDropdown from "@/app/app/admin/intervenciones/listado/filter-dropdown";

const statuses = ["Pendiente", "Finalizada", "Suspendida"];

function formatMonthYear(ts: string | number | Date) {
  const d = new Date(ts);
  const monthShort = d
    .toLocaleString("es-ES", { month: "short" })
    .replace(".", "");
  const monthCap = monthShort.charAt(0).toUpperCase() + monthShort.slice(1);
  return `${monthCap} ${d.getFullYear()}`;
}

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export default function ListadoIntervenciones() {
  const [intervention, setIntervention] = useState<InterventionDto[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [reload] = useState(false);

  const context = useContext(LoginContext);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  function go(id: string) {
    router.push(`/app/admin/intervenciones/detalles?id=${id}`);
  }

  const fetchIntervenciones = useCallback(
    async (
      pageNum: number,
      pageSize: number,
      query?: string,
      signal?: AbortSignal,
      triedRefresh = false
    ): Promise<PaginationResultDto<InterventionDto> | null> => {
      const p = Math.max(1, Math.trunc(Number(pageNum) || 1));
      const s = Math.max(1, Math.min(100, Math.trunc(Number(pageSize) || 12)));

      const url = new URL(
        "/api/intervenciones",
        (typeof window !== "undefined" && window.location?.origin) || ""
      );
      url.searchParams.set("page", String(p));
      url.searchParams.set("size", String(s));
      if (query?.trim().length) url.searchParams.set("query", query.trim());

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
          const resp2 = await fetch(
            new URL(
              "/api/auth/refresh",
              (typeof window !== "undefined" && window.location?.origin) || ""
            ),
            {
              method: "POST",
              headers: { Accept: "application/json" },
              signal: combinedSignal,
            }
          );

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
                const errTxt = txt ? ` - ${txt}` : "";
                throw new Error(
                  `API ${retryResp.status}: ${retryResp.statusText}${errTxt}`
                );
              }

              const ct2 = retryResp.headers.get("content-type") ?? "";
              if (!ct2.includes("application/json"))
                throw new Error("Expected JSON response");

              const body2 = (await retryResp.json()) as unknown;
              if (
                !body2 ||
                typeof body2 !== "object" ||
                !Array.isArray(
                  (body2 as PaginationResultDto<InterventionDto>).data
                )
              )
                throw new Error("Malformed API response");
              return body2 as PaginationResultDto<InterventionDto>;
            }
          }
        }

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          const errTxt = txt ? ` - ${txt}` : "";
          throw new Error(`API ${resp.status}: ${resp.statusText}${errTxt}`);
        }

        const ct = resp.headers.get("content-type") ?? "";
        if (!ct.includes("application/json"))
          throw new Error("Expected JSON response");

        const body = (await resp.json()) as unknown;
        if (
          !body ||
          typeof body !== "object" ||
          !Array.isArray((body as PaginationResultDto<InterventionDto>).data)
        )
          throw new Error("Malformed API response");
        return body as PaginationResultDto<InterventionDto>;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") {
          return null;
        }
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

    fetchIntervenciones(page, size, search, controller.signal)
      .then((res) => {
        if (res) {
          setIntervention(res.data);
          setTotalPages(res.totalPages ?? 1);
          try {
            const map = new Map<string, number>();
            res.data.forEach((it) => {
              const d = new Date(it.timeStamp);
              if (isNaN(d.getTime())) return;
              const key = formatMonthYear(d);
              const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
              if (!map.has(key)) map.set(key, monthStart);
            });
            const sorted = Array.from(map.entries())
              .sort((a, b) => b[1] - a[1])
              .map((e) => e[0]);
            setAvailableMonths(sorted);
          } catch (e) {
            setAvailableMonths([]);
          }
         }
       })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, size, search, reload, fetchIntervenciones]);

  // opcional: manejar cambios de selección desde el dropdown
  const onFilterSelectionChange = (
    monthsSelected: string[],
    statusesSelected: string[],
  ) => {
    // Por ahora no hacemos nada; si en el futuro queremos filtrar
    // la lista por estos valores, podemos actualizar `search` o
    // reiniciar la página aquí.
    // console.log('filter changed', monthsSelected, statusesSelected);
  };

  return (
    <div className=" max-w-[92%]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-3">
        <h1
          className="text-5xl font-bold tracking-tight leading-[1.2]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Intervenciones
        </h1>
      <div className="flex justify-end mb-2 p-3">
        <Button className="flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-900 bg-white border-2 border-gray-900 rounded-sm transition-colors duration-200 hover:bg-gray-100">
          <Plus className="w-5 h-5 mr-2" />
          <span style={{ fontFamily: "Inter, sans-serif" }}>
            Agregar intervención
          </span>
        </Button>
      </div>
      </div>
      <div className="flex justify-end mb-2 pb-2 pt-3 gap-5">
        <CustomSearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />
        <FilterDropdown
          months={availableMonths}
          statuses={statuses}
          onSelectionChangeAction={onFilterSelectionChange}
        />
      </div>
      <div className="mx-auto w-full border border-gray-300 pb-2 rounded-lg">
        <div className="sm:w-full overflow-x-auto">
          <Table className="table-fixed border-collapse">
            <TableHeader>
              <TableRow
                className="bg-gray-50 border-b border-gray-200 font-medium font-sm leading-[1.1] text-[#F3F4F6]"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                <TableHead className="w-[200px] pl-3 text-left first:rounded-tl-lg last:rounded-tr-lg">
                  Fecha y hora
                </TableHead>
                <TableHead className="w-[200px] pl-3 text-left first:rounded-tl-lg last:rounded-tr-lg">
                  Organizacion
                </TableHead>
                <TableHead className="w-[200px] pl-3 text-left first:rounded-tl-lg last:rounded-tr-lg">
                  Tipo de intervencion
                </TableHead>
                <TableHead className="w-[200px] pl-3 text-left first:rounded-tl-lg last:rounded-tr-lg">
                  Cantidad de duplas necesarias
                </TableHead>
                <TableHead className="w-[150px] pl-3 text-left first:rounded-tl-lg last:rounded-tr-lg">
                  Estado
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                ["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
                  <TableRow key={key} className="px-6 py-4">
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
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[48px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : intervention && intervention.length > 0 ? (
                intervention.map((inter) => (
                  <TableRow
                    key={inter.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                    onClick={() => {
                      go(inter.id);
                    }}
                  >
                    <TableCell className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-base md:text-base">
                          {`${new Date(inter.timeStamp).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )} ${new Date(inter.timeStamp).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="p-3">
                      <div className="flex items-center gap-2 text-sm">
                        {inter.Institucions && inter.Institucions.length > 0
                          ? inter.Institucions.map((i) => i.nombre).join(", ")
                          : ""}
                      </div>
                    </TableCell>

                    <TableCell className="p-3">
                      <div className="flex items-center gap-2 text-sm">
                        {inter.tipo}
                      </div>
                    </TableCell>

                    <TableCell className="p-3">
                      {Number(inter.pairsQuantity) || 0}
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="bg-[#F2F4F8] pt-[1px] pr-2.5 pb-[2px] pl-2.5 rounded-[10px] opacity-100 w-min">
                        {inter.status || ""}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-36 px-6 py-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-muted-foreground">
                        {search
                          ? `Intenta ajustar los términos de búsqueda: "${search}"`
                          : "No se encuentran intervenciones"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <CustomPagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
