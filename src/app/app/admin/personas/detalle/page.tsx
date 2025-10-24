"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BotonEliminarUsuario } from "./eliminar-usuario-boton";
import { MagicLinkDialog } from "./magic-link-dialog";

function DetallePersonaContent() {
  const searchParams = useSearchParams();
  const ci: string = searchParams.get("ci") ?? "";

  return (
    <div className="flex flex-col">
      Detalle Persona
      <BotonEliminarUsuario ci={ci} />
    </div>
  );
}

export default function DetallePersona() {
  return (
    <Suspense fallback={<div>Cargando persona...</div>}>
      <MagicLinkDialog
        registrationCompleted={false}
        ci={"11111111"}
        username={"Santiago"}
      />
      <DetallePersonaContent />
      <MagicLinkDialog
        registrationCompleted={true}
        ci={"11111111"}
        username={"Santiago"}
      />
    </Suspense>
  );
}
