import DetallePerro from "./DetallePerro";
import HistorialSanidad from "./historial-sanidad";
import HistorialIntervenciones from "./historial-intervenciones";

export default function PantallaPerros() {
    return (
        <>
            <DetallePerro />
            <HistorialIntervenciones />
            <HistorialSanidad />
        </>
    );
}
