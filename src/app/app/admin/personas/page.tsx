import DetallePersona from "./DetallePersona";
import ListadoPersonas from "./listado/page";
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
