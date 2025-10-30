"use client";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil } from "lucide-react";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { EventoSanidadDto } from "@/app/api/registros-sanidad/dtos/evento-sanidad.dto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoginContext } from "@/app/context/login-context";
import { SanidadContext } from "@/app/context/sanidad-context";
import CustomPagination from "@/app/components/pagination";
import CustomBreadCrumb2Links from "@/app/components/bread-crumb/bread-crumb-2links";
import EliminarEventoSanidad from "@/app/components/dogs/eliminar-evento-sanidad";

export default function HistorialSanidad() {
  const [registros, setRegistros] = useState<EventoSanidadDto[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenError, setIsOpenError] = useState(false);
  const [dogName, setDogName] = useState<string>("");
  const context = useContext(LoginContext);
  const sanidadContext = useContext(SanidadContext);

  const fetchDogDetails = useCallback(
    async (
      id: string,
      signal?: AbortSignal,
      triedRefresh = false
    ): Promise<{ perro?: { nombre?: string } } | null> => {
      const url = new URL(`/api/perros/detalles`, location.origin);
      url.searchParams.set("id", id);

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
            new URL("/api/auth/refresh", location.origin),
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
              if (!body2 || typeof body2 !== "object")
                throw new Error("Malformed API response");
              return body2 as { perro?: { nombre?: string } };
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

  const fetchRegistrosSanidad = useCallback(
    async (id: string): Promise<PaginationResultDto<EventoSanidadDto>> => {
      const token = context?.tokenJwt;
      const baseHeaders: Record<string, string> = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const triedRefresh = false;

      const resp = await fetch(
        `/api/registros-sanidad?id=${encodeURIComponent(
          id
        )}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: baseHeaders,
        }
      );
      if (!resp.ok && !triedRefresh && resp.status === 401) {
        const resp2 = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { Accept: "application/json" },
        });
        if (resp2.ok) {
          const refreshBody = (await resp2.json().catch(() => null)) as {
            accessToken?: string;
          } | null;

          const newToken = refreshBody?.accessToken ?? null;
          if (newToken) {
            context?.setToken(newToken);
            const retryResp = await fetch(
              `/api/registros-sanidad?id=${encodeURIComponent(
                id
              )}&page=${page}&size=${size}`,
              {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );

            return (await retryResp.json()) as Promise<
              PaginationResultDto<EventoSanidadDto>
            >;
          }
        }
      }
      return (await resp.json()) as PaginationResultDto<EventoSanidadDto>;
    },
    [context, page, size]
  );

  const searchParams = useSearchParams();
  const id: string = searchParams.get("id") ?? "";

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetchDogDetails(id, controller.signal),
      fetchRegistrosSanidad(id),
    ])
      .then(([dogDetails, registrosSanidad]) => {
        setDogName(dogDetails?.perro?.nombre || "");
        setRegistros(registrosSanidad.data || []);
        setTotalPages(registrosSanidad.totalPages || 1);
      })
      .catch(() => {
        setRegistros([]);
        setIsOpenError(true);
      });
  }, [
    id,
    context,
    page,
    size,
    fetchRegistrosSanidad,
    fetchDogDetails,
    sanidadContext.lastUpdate,
  ]);

  const columnHeader: string[] = ["Fecha", "Actividad"];

  return (
    <>
      <div className="w-full">
        <CustomBreadCrumb2Links
          link={["/app/admin/perros/listado", "Perros"]}
          link2={[`/app/admin/perros/detalles?id=${id}`, dogName]}
          current={"Historial de Sanidad"}
          className="mb-8"
        />
      </div>
      <div className="flex flex-col gap-5 w-full">
        <h2
          className="font-serif font-semibold text-2xl text-[#1B2F13] tracking-tight font-size-text-2xl font-family-font-serif"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Historial de Sanidad
        </h2>
        <div
          className="rounded-md border  w-full font-normal"
          style={{ fontFamily: "Archivo, sans-serif" }}
        >
          <Table className="w-full table-fixed overflow-x-scroll">
            <TableHeader className="h-[48px] text-sm text-gray-700 pointer-events-none w-full">
              <TableRow>
                <TableHead
                  className="w-[110px] min-w-[110px] sm:w-[200px] px-4 font-medium"
                  key={columnHeader[0]}
                >
                  {columnHeader[0]}
                </TableHead>
                <TableHead
                  className="px-4 w-[105px] sm:w-full min-w[105px] font-medium"
                  key={columnHeader[1]}
                >
                  {columnHeader[1]}
                </TableHead>
                <TableHead className="w-[96px] px-2 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {registros && registros.length > 0 ? (
                registros.map((registro, i) => (
                  <TableRow key={i}>
                    <TableCell className="h-[56px] min-w-[120px] px-4 sm:px-4 text-sm font-normal">
                      {`${new Date(registro.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}`}
                    </TableCell>
                    <TableCell className="h-[56px] px-4 text-sm font-normal">
                      {String(registro.activity)}
                    </TableCell>
                    <TableCell className="min-w-[96px] px-2 text-green-500 hover:text-green-700">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="shrink-0 p-1 hidden"
                          onClick={() => {
                            setIsOpenEdit(true);
                          }}
                        >
                          <Pencil />
                        </button>
                        <EliminarEventoSanidad
                          id={registro.id}
                          activity={registro.activity}
                          disabled={registro.hasPaidExpense}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-gray-400"
                  >
                    No se encuentran registros de sanidad
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

      {isOpenEdit && (
        <div className="fixed inset-0 bg-gray-500/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Editar X</h2>
            <p>Este es el contenido del modal.</p>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setIsOpenEdit(false);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpenError && (
        <div className="fixed inset-0 bg-gray-500/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>Hubo un problema con el servidor</p>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setIsOpenError(false);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
