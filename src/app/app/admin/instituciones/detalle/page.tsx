"use client";
import { useSearchParams } from "next/navigation";
import InstitutionDetail from "@/app/components/instituciones/institution-detail";

export default function Detalle() {
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("id") ?? "";

  return (
    <div>
      <InstitutionDetail id={institutionId}/>
    </div>
  );
}
