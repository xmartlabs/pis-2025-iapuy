import { Badge } from "@/components/ui/badge";

export interface Props {
  statusType:
    | "Pendiente de asignación"
    | "Cupo completo"
    | "Realizada"
    | "Finalizada"
    | "Suspendida";
}

export default function InterventionBadge({ statusType }: Props) {
  const statusStyles: Record<Props["statusType"], string> = {
    "Pendiente de asignación": "bg-[#FECACA]",
    "Cupo completo": "bg-[#FDE68A]",
    Realizada: "bg-[#BAE6FD]",
    Finalizada: "bg-[#DEEBD9]",
    Suspendida: "bg-[#D4D4D4]",
  };
  const className = statusStyles[statusType];
  return (
    <Badge
      className={`${className} !font-sans !font-semibold !text-xs !leading-4 !text-[#1B2F13] !rounded-full !py-0.5 !px-2.5`}
    >
      {statusType}
    </Badge>
  );
}
