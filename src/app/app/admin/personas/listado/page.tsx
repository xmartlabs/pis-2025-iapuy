"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight, ArrowLeft } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Button } from "@/components/ui/button";

type PerroSummary = { nombre?: string };
type UserRowBase = {
  [key: string]: string | number | boolean | null | undefined;
};
type UserRow = UserRowBase & { perros?: PerroSummary[] };

type UsersApiResponse = {
  attributes: string[];
  users: UserRow[];
  total?: number;
  page?: number;
  size?: number;
};

export default function ListadoPersonas() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users?page=${page}&size=${size}`)
      .then((res) => res.json() as Promise<UsersApiResponse>)
      .then((data) => {
        setUsers(data.users);
        if (data.total && data.size) {
          setTotalPages(Math.ceil(data.total / data.size));
        }
        setError(null);
      })
      .catch(() => {
        setError("Error al obtener usuarios.");
      });
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
      {error && <p className="text-red-500 text-center">{error}</p>}{" "}
      <div className="max-w-[1116px] mx-auto w-full mb-4 sm:mb-[20px] pt-8 sm:pt-[60px] flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0">
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
      <div className="max-w-[1116px] mx-auto w-full border border-gray-300 mt-4 sm:mt-[20px] rounded-lg">
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
              {users.map((user, i) => (
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
                                href={`/app/admin/perros/detalle/${p.nombre}`}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="mt-4 sm:mt-[5px] flex justify-center items-center gap-2">
        <Button
          onClick={handlePreviousPage}
          disabled={page === 1}
          size="sm"
          className="px-3 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1"></span>
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={page === totalPages}
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
