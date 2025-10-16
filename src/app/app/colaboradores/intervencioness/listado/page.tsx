/* eslint-disable check-file/folder-naming-convention */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import ListadoIntervenciones from "@/app/components/intervenciones/listado-intervenciones";

export default function PantallaIntervencionesCollaborador() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      toast.success("¡Evaluación guardada correctamente!", {
        duration: 5000,
        icon: null,
        className:
          "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md font-sans font-semibold text-sm leading-5 tracking-normal",
        style: {
          background: "#DEEBD9",
          border: "1px solid #BDD7B3",
          color: "#121F0D",
        },
      });

      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      const qs = params.toString();
      router.replace(
        qs
          ? `/app/colaboradores/intervenciones/listado?${qs}`
          : `/app/colaboradores/intervenciones/listado`
      );
    }
  }, [searchParams, router]);

  return (
    <>
      <ListadoIntervenciones isColab={true} />
      <Toaster position="bottom-right" richColors />
    </>
  );
}
