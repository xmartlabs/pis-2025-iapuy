"use client";

import { useSearchParams } from "next/navigation";
import { DownloadButton } from "../download-pdf";

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
          return new Date(trimmed);
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
    </div>
  );
}
