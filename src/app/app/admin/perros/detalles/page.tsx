import DetallePerro from "./detalle-perro";
import HistorialSanidad from "./historial-sanidad";
import HistorialIntervenciones from "./historial-intervenciones";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function PantallaPerros() {
  return (
    <div className="w-[96%] flex flex-col gap-4 pt-[3%] pb-[3%] pl-2">
      <DetallePerro />
      <HistorialIntervenciones />
      <HistorialSanidad />
      <Button
        type="button"
        className="flex items-center gap-1 w-[141px] h-10 min-w-[80px] rounded-md px-3 py-2 bg-red-600 text-white opacity-100"
      >
        <Trash2 className="w-4 h-4" />
        Eliminar Perro
      </Button>
    </div>
  );
}
