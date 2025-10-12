import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Dupla from "@/app/components/interventions/details/dupla";

type DetallesIntervencionDto = {
  id: string;
  org: string;
  tipo: string;
  descripcion: string;
  date: string;
  duplas: dupla[];
  companions: string[];
};

type dupla = {
  guide: string;
  dog: string;
};

export default function DogsNPersons({
  infoIntervention,
  shown,
}: {
  infoIntervention: DetallesIntervencionDto;
  shown: boolean;
}) {
  if (!shown) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      {infoIntervention.duplas.length > 0 ? (
        infoIntervention.duplas.map((dupla, index) => (
          <Dupla
            key={index}
            number={index + 1}
            guide={dupla.guide}
            dog={dupla.dog}
          />
        ))
      ) : (
        <p>No hay duplas asignadas.</p>
      )}
      {infoIntervention.companions.length > 0 && (
        <Card className="shadow-sm border rounded-2xl">
          <CardTitle
            className="px-6 text-lg font-semibold text-[#1B2F13]"
            style={{ fontFamily: "Archivo, sans-serif" }}
          >
            Acompañantes
          </CardTitle>
          <CardContent className="p-4">
            <p className="text-sm text-gray-700">
              {infoIntervention.companions.join(", ")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
