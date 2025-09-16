"use client"
import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { Button } from "@/components/ui/button";

type PerroSummary = { nombre?: string };
type UserRowBase = { [key: string]: string | number | boolean | null | undefined };
type UserRow = UserRowBase & { perros?: PerroSummary[] };

type UsersApiResponse = {
  attributes: string[];
  users: UserRow[];
  total?: number;
  page?: number;
  size?: number;
};

export default function ListadoPersonas() {
  const [attributes, setAttributes] = useState<string[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    fetch("/api/users") //to do : entender como manejar la paginacion si hay mas de una pagina
      .then((res) => res.json() as Promise<UsersApiResponse>)
      .then((data) => {
        setAttributes(data.attributes);
        setUsers(data.users);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
      });
  }, []);
  const columnHeader: string[]= ["Nombre","Cedula de identidad","Celular","Banco", "Número de Cuenta", "Perro"];
  return (
    <div className=" w-full"
    >
      <div className="max-w-[1116px] mx-auto w-full mb-[20px] pt-[60px] flex justify-between"  >{/* to do : averiguaar cuanto padding bottom */}
        <h1 className="text-5xl leading-none font-semibold tracking-[-0.025em] flex items-center" style={{ fontFamily: 'Poppins, sans-serif' }}>Personas</h1> {/* to do : con el peso en semi bold no se ve como en la ui */}
        <div className="flex justify-end items-center pt-3">
          <Button asChild className="text-sm leading-6 medium !bg-[var(--custom-green)] !text-white">
            <Link href="/app/admin/personas/nueva">+ Agregar Persona</Link>
          </Button>
        </div>
      </div>
      <div
        className="max-w-[1116px] mx-auto w-full border border-gray-300 mt-[20px] rounded-lg"
      >
      <Table>
        <TableHeader>
          <TableRow>
            {
            columnHeader.map(head => (
            <TableHead key={head} className="text-sm font-medium leading-6 medium w-[174px] h-[56px]">{head}</TableHead>
          ))}
        </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, i) => (
          <TableRow key={i}>
            {attributes
              .filter(attr => !["password", "deletedAt", "createdAt", "updatedAt"].includes(attr))
              .map(attr => {
                const value = user[attr];
                return (
                  <TableCell key={attr} className="w-[186px] h-[48px]">
                    {value === null || value === undefined ? "" : String(value)}
                  </TableCell>
                );
              })}
            <TableCell key="perros" className="w-[186px] h-[48px]">
              {Array.isArray(user.perros)
                ? user.perros.map((p, index) => (
                    p?.nombre ? (
                      <Link
                        key={index}
                        href={`/app/admin/perros/detalle/${p.nombre}`}
                        className="!underline hover:text-blue-800 mr-2"
                      >
                        {p.nombre === null ||p.nombre === undefined ? "No tiene" : p.nombre}
                      </Link>
                    ) : null
                  ))
                : ""}
            </TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
