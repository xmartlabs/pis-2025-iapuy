import React, { Suspense } from "react";
import DetallePerro from "@/app/components/dogs/detalle-perro";
import HistorialSanidad from "@/app/components/dogs/historial-sanidad";
import HistorialIntervenciones from "@/app/components/dogs/historial-intervenciones";
import EliminarPerro from "@/app/components/dogs/eliminar-perro";

export default function PantallaPerros() {
  return (
    <div className="w-[96%] flex flex-col gap-4 pb-[3%] pl-2">
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
  );
}
