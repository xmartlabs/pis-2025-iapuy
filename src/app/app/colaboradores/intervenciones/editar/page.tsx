"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EvaluarIntervencion from "./evaluar";
import HeaderIntervenciones from "./header-intervenciones";
import { useSearchParams } from "next/navigation";
import InscribirIntervencion from "./inscripcion";

export default function PantallaEvaluarIntervencion() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") as string;
  const modo = searchParams.get("modo") as string;
  let def = "persyperr";
  if(modo === "inscribirse") def = "persyperr";
  else if(modo === "evaluar") def = "diainterv";
  return (
    <>
        <HeaderIntervenciones
            id = {id}/>
        <div>
            <Tabs defaultValue={def} className="!rounded-md gap-6">
        <TabsList className="bg-[#DEEBD9] rounded-md py-1 flex items-center justify-center gap-2 max-w-[306px] h-[40px]">
          <TabsTrigger
            value="persyperr"
            className="py-2 w-[140px] h-[32px] text-center rounded-md
                      data-[state=active]:bg-white data-[state=active]:text-black 
                      data-[state=inactive]:text-[#5B9B40]"
          >
            Personas y perros
          </TabsTrigger>
          <TabsTrigger
            value="diainterv"
            className=" py-2 w-[150px] h-[32px] text-center rounded-md
                      data-[state=active]:bg-white data-[state=active]:text-black 
                      data-[state=inactive]:text-[#5B9B40]"
          >
            Día de la intervención
          </TabsTrigger>
        </TabsList>
                <TabsContent value="diainterv">
                    <EvaluarIntervencion
                    id={id} />
                </TabsContent>
                <TabsContent value="persyperr">
                    <InscribirIntervencion
                        id={id} />
                </TabsContent>
            </Tabs>
        </div>
    </>
  );
}
