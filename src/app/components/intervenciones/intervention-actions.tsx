"use client";

import { Button } from "@/components/ui/button";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const statusMap: Record<
  string,
  [string | null, string | null, boolean, string | null]
> = {
  "Pendiente de asignacion": ["pencil", "/app/colaboradores/intervenciones/editar?modo=inscribirse", true, "Inscribir"],
  // TODO: cambiar link cuando se tenga la pagina de inscripcion
  "Cupo completo": [null, null, false, null],
  Realizada: [
    "plus",
    "/app/colaboradores/intervenciones/editar?modo=evaluar",
    true,
    "Agregar info",
  ],
  Finalizada: [null, null, false, null],
  Suspendida: [null, null, false, null],
  Cerrada: [null, null, false, null],
  "": [null, null, false, null],
};

export default function InterventionActionButton({
  status,
  id,
}: {
  status: string;
  id: string;
}) {
  const [iconT, link, req, text] = statusMap[status || ""] || [
    null,
    null,
    null,
  ];
  const router = useRouter();
  return (
    <>
      {!text || text.trim() === "" ? null : (
        <div className="w-full flex items-center justify-start text-[#5B9B40] gap-2 hover:text-white">
          <Button
            onClick={(e) => {
              const buildLink = link ? link + (req ? `&id=${id}` : "") : null;
              e.stopPropagation();

              if (buildLink) router.push(buildLink);
            }}
            type="button"
            className="py-1 bg-white flex items-center justify-center px-2 gap-2 text-[#5B9B40] border-2 border-[#BDD7B3] rounded-md opacity-100 hover:bg-[#5B9B40] hover:text-white hover:border-white transition duration-300 ease-in-out"
            aria-label={text || ""}
          >
            {!iconT ? null : iconT === "pencil" ? (
              <PencilIcon className="w-4 h-4" />
            ) : iconT === "plus" ? (
              <PlusIcon className="w-4 h-4" />
            ) : null}
            {text}
          </Button>
        </div>
      )}
    </>
  );
}
