"use client"

import { Button } from "@/components/ui/button";
import EditarIntervencion from "../EditarIntervencion";
import ListadoIntervenciones from "../ListadoIntervenciones";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import { Plus } from "lucide-react";

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
      <EditarIntervencion />
      <ListadoIntervenciones />
      <div className="mt-6 flex">
        <Button
          onClick={() => { router.push("/app/colaboradores/intervenciones/evaluar"); }}
          className="
            w-auto
            min-w-[118px] 
            h-[24px]
            rounded-[6px]
            bg-[#2D3648] text-white text-[12px] font-semibold
            px-3 py-2
            flex items-center justify-center gap-2
          "        
          >
          <Plus/>
          Agregar info
        </Button>
      </div>

      <Toaster position="bottom-right" richColors />

    </>
  );
}
