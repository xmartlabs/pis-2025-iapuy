"use client";
import DetallePerro from "@/app/components/dogs/detalle-perro";
import EliminarPerro from "@/app/components/dogs/eliminar-perro";
import HistorialIntervenciones from "@/app/components/dogs/historial-intervenciones";
import HistorialSanidad from "@/app/components/dogs/historial-sanidad";
import { LoginContext } from "@/app/context/login-context";
import { SanidadProvider } from "@/app/context/sanidad-context";
import type { JwtPayload } from "jsonwebtoken";
import { Suspense, useContext } from "react";

export default function PantallaPerros() {
  const context = useContext(LoginContext);

  const token = context?.tokenJwt;

  let userType: string | null = null;

  if (token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = JSON.parse(atob(payloadBase64)) as JwtPayload;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      userType = payloadJson.type;
    } catch {
      reportError("Error al decodificar el token:");
    }
  }
  return (
    <SanidadProvider>
      <div className="w-[96%] flex flex-col gap-4 pl-2">
        <Suspense fallback={<div>Cargando detalles...</div>}>
          <DetallePerro />
        </Suspense>
        <Suspense fallback={<div>Cargando intervenciones...</div>}>
          <HistorialIntervenciones />
        </Suspense>
        <Suspense fallback={<div>Cargando historial de sanidad...</div>}>
          <HistorialSanidad isColab={true} />
        </Suspense>
        {userType === "Administrador" && (
          <Suspense fallback={<div>Cargando opciones...</div>}>
            <EliminarPerro />
          </Suspense>
        )}
      </div>
    </SanidadProvider>
  );
}
