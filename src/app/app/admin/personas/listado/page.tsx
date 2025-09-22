"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, ArrowLeft } from "lucide-react";
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

type PerroSummary = { id?:string, nombre?: string };
type UserRowBase = {
  [key: string]: string | number | boolean | null | undefined;
};
type UserRow = UserRowBase & { perros?: PerroSummary[] };

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export default function ListadoPersonas() {
  const context = useContext(LoginContext);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  async function fetchUsers(
    pageNum: number,
    pageSize: number,
    signal?: AbortSignal,
    triedRefresh = false
  ): Promise<PaginationResultDto<UserRow> | null> {
    const p = Math.max(1, Math.trunc(Number(pageNum) || 1));
    const s = Math.max(1, Math.min(100, Math.trunc(Number(pageSize) || 12)));

    const url = new URL("/api/users", BASE_API_URL);
    url.searchParams.set("page", String(p));
    url.searchParams.set("size", String(s));

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
        const resp2 = await fetch(new URL("/api/auth/refresh", BASE_API_URL), {
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
              !Array.isArray((body2 as PaginationResultDto<UserRow>).data)
            )
              throw new Error("Malformed API response");

            return body2 as PaginationResultDto<UserRow>;
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
        !Array.isArray((body as PaginationResultDto<UserRow>).data)
      )
        throw new Error("Malformed API response");

      return body as PaginationResultDto<UserRow>;
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") {
        return null;
      }
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    fetchUsers(page, size, controller.signal)
      .then((res) => {
        if (res) {
          setUsers(res.data);
          setTotalPages(res.totalPages ?? 1);
        }
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, [page, size]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };
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
    <div className="w-full px-4 sm:px-6 lg:px-8 !overflow-x-auto">
      <div className="max-w-full mx-auto w-full mb-4 sm:mb-[20px] pt-8 sm:pt-[60px] flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl leading-none font-semibold tracking-[-0.025em] flex items-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Personas
        </h1>
        <div className="flex justify-start sm:justify-end items-center">
          <Button
            asChild
            className="text-sm leading-6 medium !bg-[var(--custom-green)] !text-white w-full sm:w-auto"
          >
            <span className="flex items-center justify-center sm:justify-start">
              <Plus className="mr-2" />
              <Link href="/app/admin/personas/nueva">Agregar Persona</Link>
            </span>
          </Button>
        </div>
      </div>
      <div className="max-w-full mx-auto w-full border border-gray-300 mt-4 sm:mt-[20px] rounded-lg">
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
              {users && users.length > 0 ? (
                users.map((user, i) => (
                  <TableRow key={i}>
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
        </div>
      </div>
      <div className="mt-4 sm:mt-[5px] flex justify-center items-center gap-2">
        <Button
          onClick={handlePreviousPage}
          disabled={page === 1}
          // para evitar warning de eslint al hacer previousElementSibling y nextElementSibling
          aria-label="Página anterior"
          size="sm"
          className="px-3 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1"></span>
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={page === totalPages}
          // para evitar warning de eslint al hacer previousElementSibling y nextElementSibling
          aria-label="Página siguiente"
          size="sm"
          className="px-3 py-2"
        >
          <span className="hidden sm:inline mr-1"></span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-2 sm:mt-[5px] flex justify-center items-center">
        <p className="text-xs sm:text-sm leading-6 medium text-center">
          Página {page} de {totalPages}
        </p>
      </div>
    </div>
  );
}
