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
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { LoginContext } from "@/app/context/login-context";
import { useRouter, useSearchParams } from "next/navigation";
import type { InterventionDto } from "@/app/app/admin/intervenciones/dtos/intervention.dto";
import CustomPagination from "@/app/components/pagination";
import CustomBreadCrumb2Links from "@/app/components/bread-crumb/bread-crumb-2links";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

export default function HistorialIntervenciones() {
  const [intervention, setIntervention] = useState<InterventionDto[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [reload] = useState(false);
  const [dogName, setDogName] = useState<string>("");

  const context = useContext(LoginContext)!;
  const router = useRouter();
  const searchParams = useSearchParams();
  function go(id: string) {
    router.push(`/app/admin/intervenciones/detalles?id=${id}`);
  }

  const fetchDogDetails = useCallback(
    async (
      id: string,
      signal?: AbortSignal
    ): Promise<{ perro?: { nombre?: string } } | null> => {
      const url = new URL(`/api/perros/detalles`, location.origin);
      url.searchParams.set("id", id);

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);
      const combinedSignal = signal ?? controller.signal;

      try {
        const resp = await fetchWithAuth(context, url.toString(), {
          method: "GET",
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
        if (!body || typeof body !== "object")
          throw new Error("Malformed API response");

        return body as { perro?: { nombre?: string } };
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

  const fetchIntervenciones = useCallback(
    async (
      id: string,
      pageNum: number,
      pageSize: number,
      signal?: AbortSignal
    ): Promise<PaginationResultDto<InterventionDto> | null> => {
      const p = Math.max(1, Math.trunc(Number(pageNum) || 1));
      const s = Math.max(1, Math.min(100, Math.trunc(Number(pageSize) || 12)));

      const url = new URL(`/api/perros/interventions`, location.origin);
      url.searchParams.set("id", id);
      url.searchParams.set("page", String(p));
      url.searchParams.set("size", String(s));

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);
      const combinedSignal = signal ?? controller.signal;

      try {
        const resp = await fetchWithAuth(context, url.toString(), {
          method: "GET",
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

  const id: string = searchParams.get("id") ?? "";

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    Promise.all([
      fetchDogDetails(id, controller.signal),
      fetchIntervenciones(id, page, size, controller.signal),
    ])
      .then(([dogDetails, interventionRes]) => {
        if (dogDetails?.perro?.nombre) {
          setDogName(dogDetails.perro.nombre);
        }
        if (interventionRes) {
          setIntervention(interventionRes.data);
          setTotalPages(interventionRes.totalPages ?? 1);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [id, page, size, reload, fetchIntervenciones, fetchDogDetails]);

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="w-full">
        <CustomBreadCrumb2Links
          link={["/app/admin/perros/listado", "Perros"]}
          link2={[`/app/admin/perros/detalles?id=${id}`, dogName]}
          current={"Historial de Intervenciones"}
          className="mb-8"
        />
      </div>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <h1
          className="font-serif font-semibold text-2xl leading-8 tracking-tight text-[#1B2F13] font-size-text-2xl font-family-font-serif"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Historial de Intervenciones
        </h1>
      </div>
      <div className="mx-auto w-full border border-gray-300 pb-2 rounded-lg">
        <div className="sm:w-full overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow
                className="border-b border-gray-200 font-medium font-sm leading-[1.1] text-gray-700 pointer-events-none"
                style={{ fontFamily: "Archivo, sans-serif" }}
              >
                <TableHead className="w-[200px] pl-3 text-left first:rounded-tl-lg last:rounded-tr-lg">
                  Fecha y hora
                </TableHead>
                <TableHead className="w-fill pl-3 text-left first:rounded-tl-lg last:rounded-tr-lg">
                  Organizacion
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i} className="px-6 py-4">
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[160px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : intervention.length > 0 ? (
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
                        {Array.isArray(inter.Institucions) &&
                        inter.Institucions.length > 0
                          ? (inter.Institucions as Array<{ nombre?: string }>)
                              .map((inst) => inst?.nombre ?? "")
                              .filter(Boolean)
                              .join(", ")
                          : ""}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-36 px-6 py-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-muted-foreground">
                        No se encuentran registros de intervenciones
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {totalPages > 1 && (
        <CustomPagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />
      )}
    </div>
  );
}
