import DetallePerro from "@/app/components/dogs/detalle-perro";
import HistorialIntervenciones from "@/app/components/dogs/historial-intervenciones";
import HistorialSanidad from "@/app/components/dogs/historial-sanidad";

export default function PantallaPerros() {
  return (
    <div className="w-[96%] flex flex-col gap-4 pb-[3%] pl-2">
      <DetallePerro />
      <HistorialIntervenciones />
      <HistorialSanidad />
    </div>
  );
}
