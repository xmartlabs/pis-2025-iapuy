import { Toaster } from "@/components/ui/sonner";
import CustomBreadCrumb from "@/app/components/bread-crumb/bread-crumb"
import Formulario from "./formulario";

export default function NuevaPersona() {
  return (
    <div className="pb-15 pl-8 pr-8 space-y-8">
      <CustomBreadCrumb link={["/app/admin/personas/listado","Personas"]} current={"Nueva persona"} className=""/>
      <h1 className="align-middle font-serif text-5xl font-semibold tracking-tight text-accent-foreground">
        Nueva persona
      </h1>
      <Formulario />
      <Toaster />
    </div>
  );
}
