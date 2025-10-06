import React, { Suspense } from "react";
import RegistroSanidad from "../registrar-sanidad";

export default function RegistrarSanidadPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegistroSanidad />
    </Suspense>
  );
}