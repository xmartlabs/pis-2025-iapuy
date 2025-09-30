import EditarIntervencion from "../EditarIntervencion";
import EvaluarIntervencion from "../evaluar-intervencion";
import ListadoIntervenciones from "../ListadoIntervenciones";

export default function PantallaIntervencionesCollaborador() {
  return (
    <>
      <EditarIntervencion />
      <ListadoIntervenciones />
      <EvaluarIntervencion/>
    </>
  );
}
