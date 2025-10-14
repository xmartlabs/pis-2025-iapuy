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
    <Card className="border border-[#BDD7B3] rounded-lg">
      <CardTitle
        className="px-6 text-xl leading-7 font-semibold text-[#1B2F13]"
        style={{ fontFamily: "Archivo, sans-serif" }}
      >{`Dupla ${number}`}</CardTitle>
      <CardContent className="px-6">
        <div className="flex flex-row gap-7">
          <div className="flex flex-col gap-2">
            <span className="text-xs">GUÍA</span>
            <span className="leading-7 text-[#121F0D]">{guide}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs">PERRO</span>
            <span className="leading-7 text-[#121F0D]">{dog}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
