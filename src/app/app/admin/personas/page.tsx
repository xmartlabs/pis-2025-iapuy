import DetallePersona from "./detalle/page";
import ListadoPersonas from "./ListadoPersonas";
import NuevaPersona from "./NuevaPersona";

export default function PantallaPersonas() {
  return (
    <>
      <DetallePersona />
      <ListadoPersonas />
      <NuevaPersona />
    </>
  );
}
