"use client";

import { useSearchParams } from "next/navigation";
import { DownloadButton } from "../download-pdf";
import DeleteInstitutionButton from "../eliminar-institucion";

export default function Detalle() {
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("id") ?? "";

  const getDatesFromParams = (): Date[] => {
    //this will be changed when the UI for date selection is ready on the "detalle institucion" User story,
    //it will be the filter multiselect button instead of a param
    const datesParam = searchParams.get("dates");

    if (!datesParam || datesParam.trim() === "") {
      return [];
    }

    try {
      const dateStrings = datesParam.split(",");
      const dates = dateStrings
        .map((dateStr) => {
          const trimmed = dateStr.trim();
          const date = new Date(trimmed);
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            //Parse as local date to avoid timezone shifts
            const [year, month, day] = trimmed.split("-").map(Number);
            return new Date(year, month - 1, day);
          }
          return date;
        })
        .filter((date) => !isNaN(date.getTime()));
      return dates;
    } catch {
      return [];
    }
  };

  const selectedDates = getDatesFromParams();

  return (
    <div>
      <h1>Pantalla de Detalle Institucion</h1>
      <DownloadButton id={institutionId} dates={selectedDates} />
      <DeleteInstitutionButton id={institutionId} />
    </div>
  );
}
