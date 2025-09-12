"use client"
import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"

type UsersApiResponse = {
  attributes: string[];
  users: Record<string, unknown>[];
};

export default function ListadoPersonas() {
  const [attributes, setAttributes] = useState<string[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);

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

  return (
    <div>
      <h1>Listado de Personas</h1>
      <Table>
        <TableCaption>Lista de los Usuarios de la plataforma</TableCaption>
        <TableHeader>
          <TableRow>
          {attributes.map((attr) => (
            <TableHead key={attr}>{attr}</TableHead>
          ))}
        </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, i) => (
          <TableRow key={i}>
            {attributes.map((attr) => (
              <TableCell key={attr}>{String(user[attr] ?? "")}</TableCell>
            ))}
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </div>
  );
}
