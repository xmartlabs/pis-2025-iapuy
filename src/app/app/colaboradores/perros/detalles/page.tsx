"use client";
import DetallePerro from "@/app/components/dogs/detalle-perro";
import EliminarPerro from "@/app/components/dogs/eliminar-perro";
import HistorialIntervenciones from "@/app/components/dogs/historial-intervenciones";
import HistorialSanidad from "@/app/components/dogs/historial-sanidad";
import { SanidadProvider } from "@/app/context/sanidad-context";
import { Suspense } from "react";

export default function PantallaPerros() {
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
          <HistorialSanidad />
        </Suspense>
        <Suspense fallback={<div>Cargando opciones...</div>}>
          <EliminarPerro />
        </Suspense>
      </div>
    </SanidadProvider>
  );
}
