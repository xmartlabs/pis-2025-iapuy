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

  useEffect(() => {
    fetch(`/api/users?page=${page}&size=${size}`)
      .then((res) => res.json() as Promise<UsersApiResponse>)
      .then((data) => {
        setUsers(data.users);
        if (data.total && data.size) {
          setTotalPages(Math.ceil(data.total / data.size));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
      });

    /*to do :manejar error*/
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
    "Cedula de identidad": "ci",
    Celular: "celular",
    Banco: "banco",
    "Número de Cuenta": "cuentaBancaria",
  };
  const columnHeader: string[] = [
    "Nombre",
    "Cedula de identidad",
    "Celular",
    "Banco",
    "Número de Cuenta",
    "Perro",
  ];
  return (
    <div className=" w-full">
      <div className="max-w-[1116px] mx-auto w-full mb-[20px] pt-[60px] flex justify-between">
        {/* to do : averiguar cuanto padding bottom */}
        <h1
          className="text-5xl leading-none font-semibold tracking-[-0.025em] flex items-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Personas
        </h1>
        {/* to do : con el peso en semi bold no se ve como en la ui */}
        <div className="flex justify-end items-center pt-3">
          <Button
            asChild
            className="text-sm leading-6 medium !bg-[var(--custom-green)] !text-white"
          >
            <span className="flex items-center">
              <Plus />
              <Link href="/app/admin/personas/nueva">Agregar Persona</Link>
            </span>
          </Button>
        </div>
      </div>
      <div className="max-w-[1116px] mx-auto  w-full border border-gray-300 mt-[20px] rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {columnHeader.map((head) => (
                <TableHead
                  key={head}
                  className="text-sm font-medium leading-6 medium w-[174px] h-[56px]"
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, i) => (
              <TableRow key={i}>
                {Object.keys(columnToAttribute).map((column) => {
                  const attribute = columnToAttribute[column];
                  const value = user[attribute];
                  return (
                    <TableCell key={column} className="w-[186px] h-[48px]">
                      {value === null || value === undefined
                        ? ""
                        : String(value)}
                    </TableCell>
                  );
                })}
                <TableCell key="perros" className="w-[186px] h-[48px]">
                  {Array.isArray(user.perros)
                    ? user.perros.map((p, index) =>
                        p?.nombre ? (
                          <Link
                            key={index}
                            href={`/app/admin/perros/detalle/${p.nombre}`}
                            className="!underline hover:text-blue-800 mr-2"
                          >
                            {p.nombre === null || p.nombre === undefined
                              ? "No tiene"
                              : p.nombre}
                          </Link>
                        ) : null
                      )
                    : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-[5px] flex justify-center items-center">
        <Button onClick={handlePreviousPage} disabled={page === 1}>
          <ArrowLeft />
        </Button>
        <Button onClick={handleNextPage} disabled={page === totalPages}>
          <ArrowRight />
        </Button>
      </div>
      <div className="mt-[5px] flex justify-center items-center">
        <p className="text-sm leading-6 medium">
          Página {page} de {totalPages}
        </p>
      </div>
    </div>
  );
}
