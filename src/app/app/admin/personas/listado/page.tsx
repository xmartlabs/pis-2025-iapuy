"use client"
import { useEffect, useState } from "react";

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
    fetch("/api/users") //to do : entender como manejar la paginacion
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
    <div className="w-[1180px] ml-[20px]">
      <div className="w-[1116px] mb-[20px] pr-[20px]"  >{/* to do : averiguiar cuanto padding bottom */}
        <h1 className="text-5xl leading-none font-semibold">Personas</h1>
        <Button variant="outline">+ Agregar Persona</Button>
      </div>
      <div
        className="border border-gray-300 mt-[20px] overflow-x-auto"
        style={{
          width: 'calc(100% - 260px)',
          paddingRight: '20px',
          marginRight: '20px',
        }}
      >
      <Table>
        <TableHeader>
          <TableRow>
            {
            columnHeader.map(head => (
            <TableHead key={head} className="text-sm font-medium font-sans leading-6 medium w-[174px] h-[56px]">{head}</TableHead>
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
                ? user.perros
                    .map(p => p?.nombre)
                    .filter(Boolean)
                    .join(", ")
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
