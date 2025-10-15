import Dupla from "@/app/components/interventions/details/dupla";
import type { ApiResponse } from "./types";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function DogsNPersons({
  infoIntervention,
  shown,
}: {
  infoIntervention: ApiResponse;
  shown: boolean;
}) {
  if (!shown) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {infoIntervention.pairsQuantity > 0 ? (
        infoIntervention.UsrPerroIntervention.map((dupla, index) => (
          <Dupla
            key={index}
            number={index + 1}
            guide={dupla.User.nombre}
            dog={dupla.Perro.nombre}
          />
        ))
      ) : (
        <p>No hay duplas asignadas.</p>
      )}
      <Card className="border border-[#BDD7B3] rounded-lg">
        <CardTitle
          className="px-6 text-xl leading-7 font-semibold text-[#1B2F13]"
          style={{ fontFamily: "Archivo, sans-serif" }}
        >
          Acompañantes
        </CardTitle>
        {infoIntervention.Acompania.length > 0 ? (
          <CardContent className="px-6">
            <p className="leading-7 text-[#121F0D]">
              {infoIntervention.Acompania.map(
                (acomp) => acomp.User.nombre
              ).join(", ")}
            </p>
          </CardContent>
        ) : (
          <CardContent className="px-6">
            <p className="text-sm text-gray-700">No hay acompañantes.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
