// src\app\app\admin\personas\detalle\page.tsx
'use client'

import React, { Suspense, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CustomBreadCrumb from "@/app/components/bread-crumb/bread-crumb"
import { BotonEliminarUsuario } from "./eliminar-usuario-boton";
import { LoginContext } from "@/app/context/login-context";
import type { UserSanitized } from "@/app/api/users/service/user.service.ts";

function DetallePersonaContent() {
  const context = useContext(LoginContext);
  const searchParams = useSearchParams();
  const ci: string = searchParams.get("ci") ?? "";
  const [user, setUser] = useState<UserSanitized | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = context?.tokenJwt;
    const baseHeaders: Record<string, string> = {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const fetchUser = async (): Promise<UserSanitized | null> => {
        const resp = await fetch(`/api/users/${ci}`, {
          method: "GET",
          headers: baseHeaders,
        });
        if (!resp.ok) {
          throw new Error('Error obtaining user');
        }
        const respJson = await resp.json() as UserSanitized;
        return respJson;
      };

    const loadUser = async () => {
      setLoading(true);
      try {
        const userData = await fetchUser();
        setUser(userData);
      } catch {
        throw new Error('Error loading user');
      } finally {
        setLoading(false);
      }
    };

    if (ci) {
      loadUser().catch(() => {
        throw new Error('Error loading user');
      });
    }
  }, [ci, context?.tokenJwt]);

  if (loading) {
    return <div>Cargando persona...</div>;
  }

  return (
    <div className="flex flex-col max-w-md">
      <CustomBreadCrumb
        link={["/app/admin/personas/listado", "Personas"]}
        current={`${user?.nombre}`}
        className=""
      />

      <h1 className="mt-8 mb-8 align-middle font-serif text-5xl font-semibold tracking-tight text-accent-foreground">
        {user?.nombre}
      </h1>

      <div className="space-y-4">
        <div>
          <p className="text-xs leading-4 uppercase font-sans">
            CÉDULA DE IDENTIDAD
          </p>
          <p className="text-base leading-7 normal font-sans">{user?.ci}</p>
        </div>

        <div>
          <p className="text-xs leading-4 uppercase font-sans">
            CELULAR
          </p>
          <p className="text-base leading-7 normal font-sans">{user?.celular}</p>
        </div>

        <div>
          <p className="text-xs leading-4 uppercase font-sans">
            BANCO
          </p>
          <p className="text-base leading-7 normal font-sans">{user?.banco}</p>
        </div>

        <div>
          <p className="text-xs leading-4 uppercase font-sans">
            NÚMERO DE CUENTA
          </p>
          <p className="text-base leading-7 normal font-sans">{user?.cuentaBancaria}</p>
        </div>

        {/*{user?.perros && user.perros.length > 0 ?*/} {/*to not show if perros is empty*/} 
          <div>
            <p className="text-xs leading-4 uppercase font-sans">
              PERRO
            </p>
            <p className="text-base leading-7 normal font-sans">
              {user?.perros && user?.perros.length > 0 ? user?.perros?.map((p) => p.nombre).join(", ") : "No tiene"}
            </p>
          </div> 
        {/*}: null}*/}

        <div>
          <p className="text-xs leading-4 uppercase font-sans">
            ROL
          </p>
          <p className="text-base leading-7 normal font-sans">
            {user?.esAdmin ? "Administrador" : "Colaborador"}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <BotonEliminarUsuario ci={ci} />
      </div>
    </div>
  );
}

export default function DetallePersona() {
  return (
    <Suspense fallback={<div>Cargando persona...</div>}>
      <DetallePersonaContent />
    </Suspense>
  );
}