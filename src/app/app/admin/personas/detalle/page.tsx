'use client'

import React, { Suspense } from "react";
import { useContext} from "react";
import { useSearchParams } from "next/navigation";
import { BotonEliminarUsuario } from "./eliminar-usuario-boton";
import { LoginContext } from "@/app/context/login-context";
import type { UserSanitized } from "@/app/api/users/service/user.service.ts";

function DetallePersonaContent() {
  const context = useContext(LoginContext);
  const searchParams = useSearchParams();
  const ci: string = searchParams.get("ci") ?? "";

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
    if (!resp) {
      console.error("Error al obtener el usuario");
      return null;
    } 
    console.error("obtenido resp");
    const respJson = await resp.json() as UserSanitized;
    console.error("Sin Error");
    return respJson;
};
  return (
    <div className="flex flex-col">
      Detalle Persona CI: {ci}, nombre {fetchUser().then(user => user?.nombre ?? 'Desconocido')}
      <BotonEliminarUsuario ci={ci} />
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