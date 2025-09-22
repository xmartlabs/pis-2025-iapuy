<<<<<<< HEAD
import DetallePersona from "./detalle/page";
import ListadoPersonas from "./ListadoPersonas";
=======
import DetallePersona from "./DetallePersona";
import ListadoPersonas from "./listado/page";
>>>>>>> dev
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
