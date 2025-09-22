import DetallePerro from "./detalle-perro";
import HistorialSanidad from "./historial-sanidad";
import HistorialIntervenciones from "./historial-intervenciones";
import EliminarPerro from "./eliminar-perro";

export default function PantallaPerros() {
  return (
    <div className="w-[96%] flex flex-col gap-4 pt-[3%] pb-[3%] pl-2">
      <DetallePerro />
      <HistorialIntervenciones />
      <HistorialSanidad />
      <EliminarPerro />
    </div>
  );
}
