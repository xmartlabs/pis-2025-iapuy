"use client";

import React, { Suspense } from "react";
import MiPerfil from "./mi-perfil";

export default function PantallaInsituciones() {
  return (
    <Suspense fallback={<div>Cargando perfil...</div>}>
      <MiPerfil />
    </Suspense>
  );
}
