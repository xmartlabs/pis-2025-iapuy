import Migas from "./migas";
import Formulario from "./formulario";

export default function NuevaPersona() {
  return (
    <div className="pt-15 pb-15 pl-8 pr-8 space-y-8">
        <Migas/>
        <h1 className="align-middle font-serif text-5xl font-semibold tracking-tight text-accent-foreground">Nueva persona</h1>
        <Formulario />
    </div>
  );
}
