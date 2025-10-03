"use client";
import { useContext, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginContext } from "@/app/context/login-context";
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
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type UserData = CreateUserDto & {
  perros?: Array<{ nombre: string }>;
  esAdmin?: boolean;
};

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export default function DetallePersona() {
  const context = useContext(LoginContext);
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userCi = context?.userCI;

  const fetchUser = useCallback(
    async (
      signal?: AbortSignal,
      triedRefresh = false
    ): Promise<UserData | null> => {
      if (!userCi) {
        if (!context?.tokenJwt) {
          setError("Debes iniciar sesión para ver tu perfil");
        } else {
          setError(
            "No se pudo identificar el usuario. Por favor, inicia sesión nuevamente."
          );
        }
        return null;
      }

      const url = new URL(`/api/users/profile`, BASE_API_URL);

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
            new URL("/api/auth/refresh", BASE_API_URL),
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

              return body2 as UserData;
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

        return body as UserData;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") {
          return null;
        }
        return null;
      } finally {
        clearTimeout(timeout);
      }
    },
    [userCi, context]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchUser(controller.signal)
      .then((res) => {
        if (res) {
          setUser(res);
          setError(null);
        }
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, [fetchUser]);

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
          <div className=" items-center gap-3">
            <Label htmlFor="text">Rol</Label>
            <RadioGroup
              className="flex pt-5"
              value={user?.esAdmin ? "administrador" : "colaborador"}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="administrador" id="r1" />
                <Label htmlFor="r1">Administrador</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="colaborador" id="r2" />
                <Label htmlFor="r2">Colaborador</Label>
              </div>
            </RadioGroup>
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
            <Input type="text" id="ci" defaultValue={userCi || ""} readOnly />
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
                  placeholder={user?.perros?.[0]?.nombre || "Perros"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Perros</SelectLabel>
                  {user && Array.isArray(user.perros) && user.perros.length > 0
                    ? user.perros.map((p, index) =>
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
            <Checkbox checked={!user?.perros || user.perros.length === 0} />
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
        {!user?.esAdmin && (
          <div className="flex w-[732px] justify-start items-center mt-3">
            <Alert>
              <Info />
              <AlertTitle>
                Si necesitás una nueva contraseña, ponete en contacto con IAPUy
              </AlertTitle>
              <AlertDescription>Celular de contacto: 98554662</AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
