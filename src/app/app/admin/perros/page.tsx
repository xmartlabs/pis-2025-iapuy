import RegistroSanidad from "./registrar-sanidad"
import DetallePerro from "./DetallePerro";
import ListadoPerros from "./listado-perros";

export default function PantallaPerros() {
  return (
    <>
      <DetallePerro />
      <ListadoPerros />
      <RegistroSanidad />
    </>
  );
}
 