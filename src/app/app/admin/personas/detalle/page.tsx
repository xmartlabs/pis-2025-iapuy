"use client";

import React, { Suspense, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CustomBreadCrumb from "@/app/components/bread-crumb/bread-crumb";
import { BotonEliminarUsuario } from "./eliminar-usuario-boton";
import { MagicLinkDialog } from "./magic-link-dialog";
import { LoginContext } from "@/app/context/login-context";
import type { UserSanitized } from "@/app/api/users/service/user.service.ts";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

function DetallePersonaContent() {
  const context = useContext(LoginContext)!;
  const searchParams = useSearchParams();
  const ci: string = searchParams.get("ci") ?? "";
  const [user, setUser] = useState<UserSanitized | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!ci) return;
      setLoading(true);

      try {
        const resp = await fetchWithAuth(
          context,
          `/api/users/${ci}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(
            `API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`
          );
        }

        const userData = (await resp.json()) as UserSanitized;
        setUser(userData);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error loading user:", err);
        throw new Error("Error loading user");
      } finally {
        setLoading(false);
      }
    };

    loadUser().catch(() => { throw new Error("Error loading user"); });
  }, [ci, context]);

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
        {!user?.isActivated && (
          <MagicLinkDialog
            registrationCompleted={user?.isActivated ?? false}
            ci={user?.ci ?? ""}
            username={user?.nombre ?? ""}
          />
        )}
        <div>
          <p className="text-xs leading-4 uppercase font-sans">
            CÉDULA DE IDENTIDAD
          </p>
          <p className="text-base leading-7 normal font-sans">{user?.ci}</p>
        </div>
        <div>
          <p className="text-xs leading-4 uppercase font-sans">CELULAR</p>
          <p className="text-base leading-7 normal font-sans">
            {user?.celular}
          </p>
        </div>
        <div>
          <p className="text-xs leading-4 uppercase font-sans">BANCO</p>
          <p className="text-base leading-7 normal font-sans">{user?.banco}</p>
        </div>
        <div>
          <p className="text-xs leading-4 uppercase font-sans">
            NÚMERO DE CUENTA
          </p>
          <p className="text-base leading-7 normal font-sans">
            {user?.cuentaBancaria}
          </p>
        </div>
        {/*{user?.perros && user.perros.length > 0 ?*/}{" "}
        {/*to not show if perros is empty*/}
        <div>
          <p className="text-xs leading-4 uppercase font-sans">PERRO</p>
          <p className="text-base leading-7 normal font-sans">
            {user?.perros && user?.perros.length > 0
              ? user?.perros?.map((p) => p.nombre).join(", ")
              : "No tiene"}
          </p>
        </div>
        {/*}: null}*/}
        <div>
          <p className="text-xs leading-4 uppercase font-sans">ROL</p>
          <p className="text-base leading-7 normal font-sans">
            {user?.esAdmin ? "Administrador" : "Colaborador"}
          </p>
        </div>
      </div>

      <div className="mb-8 mt-8">
        <BotonEliminarUsuario ci={ci} />
      </div>
      {user?.isActivated && (
        <MagicLinkDialog
          registrationCompleted={user?.isActivated ?? true}
          ci={user?.ci ?? ""}
          username={user?.nombre ?? ""}
        />
      )}
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
