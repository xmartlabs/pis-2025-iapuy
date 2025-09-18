"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { User } from "@/app/models/user.entity";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DetallePersona() {
  const [user, setUser] = useState<User>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users?`)
      .then((res) => res.json() as Promise<User>)
      .then((data) => {
        setUser(data);
        setError(null);
      })
      .catch(() => {
        setError("Error al obtener usuario.");
        setUser(null);
      });
  }, []);

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
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="max-w-[1116px] mx-auto w-full mb-4 sm:mb-[20px] pt-8 sm:pt-[60px] flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl leading-none font-semibold tracking-[-0.025em] flex items-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Mi Perfil
        </h1>
      </div>

      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" placeholder="Email" />
      </div>

      <div className="flex justify-start sm:justify-end items-center">
        <Button
          asChild
          className="text-sm leading-6 medium !bg-[var(--custom-green)] !text-white w-full sm:w-auto"
        >
          <span className="flex items-center justify-center sm:justify-start">
            <Link href="/app/admin/personas/nueva">Guardar Cambios</Link>
          </span>
        </Button>
      </div>
    </div>
  );
}
