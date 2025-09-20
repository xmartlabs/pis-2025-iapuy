"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateUserDto } from "@/app/api/users/dtos/create-user.dto";

type PerroSummary = { nombre?: string };

type UserData = CreateUserDto & {
  banco?: string;
  userPerros?: PerroSummary[];
};
export default function DetallePersona() {
  const searchParams = useSearchParams();
  const ci = searchParams.get("ci");

  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ci) return;

    fetch(`/api/users/${ci}`)
      .then((res) => res.json() as Promise<UserData>)
      .then((data) => {
        setUser(data);
        setError(null);
      })
      .catch(() => {
        setError("Error al obtener usuario.");
        setUser(null);
      });
  }, [ci]);

  return (
    <div className="!overflow-x-auto">
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="w-full mb-4 sm:mb-[20px] pt-8 sm:pt-[60px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl leading-none font-semibold tracking-[-0.025em] flex items-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Mi Perfil
        </h1>
      </div>
      <div className="sm:w-[1116px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="grid  items-center gap-3">
            <Label htmlFor="text">Nombre</Label>
            <Input type="text" id="nombre" defaultValue={user?.nombre || ""} />
          </div>
          <div className="grid items-center gap-3">
            <Label htmlFor="text">Contraseña</Label>
            <Input
              type="text"
              id="contraseña"
              defaultValue={user?.password || ""}
            />
          </div>
          <div className=" items-center gap-3">
            <Label htmlFor="text">Rol</Label>
            <RadioGroup className="flex pt-5" defaultValue="Administrador">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="administrador" id="r1" />
                <Label htmlFor="r1">Administrador</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="Colaborador" id="r2" />
                <Label htmlFor="r2">Colaborador</Label>
              </div>
            </RadioGroup>
            {/*TO DO - Obtener el rol desde el login*/}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="grid  items-center gap-3">
            <Label htmlFor="email">Banco</Label>
            <Input type="email" id="banco" defaultValue={user?.banco || ""} />
          </div>
          <div className="grid  items-center gap-3">
            <Label htmlFor="email">Numero de Cuenta</Label>
            <Input
              type="email"
              id="email"
              defaultValue={user?.cuentaBancaria || ""}
            />
          </div>
          <div className="grid items-center gap-3">
            <Label htmlFor="text">Cedula de Identidad</Label>
            <Input type="text" id="rol" defaultValue={user?.ci || ""} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="grid items-center gap-3">
            <Label htmlFor="email">Celular</Label>
            <Input
              type="email"
              id="celular"
              defaultValue={user?.celular || ""}
            />
          </div>
          <div className="grid items-center gap-3">
            <Label htmlFor="text">Perros</Label>
            <Select>
              <SelectTrigger className="w-[180px] w-full">
                <SelectValue
                  placeholder={user?.userPerros?.[0]?.nombre || "Perros"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Perros</SelectLabel>
                  {user &&
                  Array.isArray(user.userPerros) &&
                  user.userPerros.length > 0
                    ? user.userPerros.map((p, index) =>
                        p?.nombre ? (
                          <SelectItem key={index} value={p.nombre}>
                            {p.nombre}
                          </SelectItem>
                        ) : null
                      )
                    : "No tiene"}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={!user?.userPerros || user.userPerros.length === 0}
            />
            <p>No tiene</p>
          </div>
        </div>

        <div className="flex justify-start items-center">
          <Button
            asChild
            className="text-sm leading-6 medium !bg-[var(--custom-green)] !text-white w-full sm:w-auto"
          >
            <span className="flex items-center justify-center sm:justify-start">
              <Link href="">Guardar Cambios</Link>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
