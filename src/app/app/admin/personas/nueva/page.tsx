import Migas from "./Migas";
import Formulario from "./Formulario";

export default function NuevaPersona() {
  return (
    <div className="space-y-8">
        <Migas/>
        <div className="gap-[773px]">
          <h1 className="align-middle text-5xl font-semibold tracking-wide text-accent-foreground">Nueva persona</h1>
        </div>
        <Formulario />
    </div>
  );
}