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
  let def;
  if(modo === "inscribirse") def = "persyperr";
  else if(modo === "evaluar") def = "diainterv";
  return (
    <>
        <HeaderIntervenciones
            id = {id}/>
        <div>
            <Tabs defaultValue={def} className="w-full">
                    <TabsList
                    className="flex max-w-[329px] bg-transparent p-0 justify-start gap-6 relative
                    after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#717D96]/20"
                    >
                    <TabsTrigger
                        value="persyperr"
                        className="
                        inline-flex px-0 py-2
                        font-inter font-bold text-[16px]
                        text-[#717D96] bg-transparent rounded-none
                        border-0 shadow-none ring-0 outline-none
                        focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-0
                        disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-100
                        relative
                        after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-transparent
                        "
                        >
                        Personas y perros
                    </TabsTrigger>

                    <TabsTrigger
                        value="diainterv"
                        className="
                        inline-flex px-0 py-2
                        font-inter font-bold text-[16px]
                        text-[#717D96] bg-transparent rounded-none
                        border-0 shadow-none ring-0 outline-none
                        focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-0
                        relative
                        after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-transparent
                        data-[state=active]:text-[#2D3648]
                        data-[state=active]:after:bg-[#2D3648]
                        data-[state=active]:bg-transparent
                        data-[state=active]:border-0
                        data-[state=active]:shadow-none
                        data-[state=active]:ring-0
                        data-[state=active]:outline-none
                        data-[state=active]:focus:outline-none
                        after:transition-colors after:duration-150
                        "
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
