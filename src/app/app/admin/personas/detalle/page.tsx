"use client";

import { useSearchParams } from "next/navigation";
import { BotonEliminarUsuario } from "./eliminar-usuario-boton";

export default function DetallePersona() {
  const searchParams = useSearchParams();
  const ci: string = searchParams.get("ci") ?? "";

  return (
    <div className="flex flex-col">
      Detalle Persona
      <BotonEliminarUsuario ci={ci} />
    </div>
  );
}
