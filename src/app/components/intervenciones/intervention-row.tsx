import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import type { InterventionDto } from "../../app/admin/intervenciones/dtos/intervention.dto";

export default function InterventionRow({
  intervention,
  institution,
}: {
  intervention: InterventionDto;
  institution: string;
}) {
  const interventionDate = new Date(intervention.timeStamp);

  return (
    <div className=" mb-8 max-w-full mx-auto w-full border border-gray-300 mt-4 sm:mt-[20px] rounded-lg">
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Institución</TableHead>
              <TableHead>Tipo de intervención</TableHead>
              <TableHead>Cantidad de duplas necesarias</TableHead>
            </TableRow>
            <TableRow>
              <TableCell>{`${interventionDate.getDate()}/${
                interventionDate.getMonth() + 1
              }/${interventionDate.getFullYear()} ${interventionDate.getHours()}:${interventionDate
                .getMinutes()
                .toString()
                .padStart(2, "0")}`}</TableCell>
              <TableCell>{institution}</TableCell>
              <TableCell>{intervention.tipo}</TableCell>

              <TableCell>{intervention.pairsQuantity}</TableCell>
            </TableRow>
          </TableHeader>
        </Table>
      </div>
    </div>
  );
}
