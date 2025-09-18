import RegistroSanidad from "./registrar-sanidad"
import DetallePerro from "./DetallePerro";
import ListadoPerros from "./ListadoPerros";

export default function PantallaPerros() {
  return (
    <>
      <DetallePerro />
      <ListadoPerros />
      <RegistroSanidad />
    </>
  );
}
