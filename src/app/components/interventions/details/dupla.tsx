import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function Dupla({
  number,
  guide,
  dog,
}: {
  number?: number;
  guide?: string;
  dog?: string;
}) {
  return (
    <Card className="shadow-sm border rounded-2xl">
      <CardTitle
        className="px-6 text-lg font-semibold text-[#1B2F13]"
        style={{ fontFamily: "Archivo, sans-serif" }}
      >{`Dupla ${number}`}</CardTitle>
      <CardContent className="px-6">
        <div className="text-sm flex flex-row gap-7">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700">Guía:</span>
            <span>{guide}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700">Perro:</span>
            <span>{dog}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
