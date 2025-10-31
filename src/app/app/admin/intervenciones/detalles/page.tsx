"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { LoginContext } from "@/app/context/login-context";
import { useSearchParams } from "next/navigation";
import CustomBreadCrumb from "@/app/components/bread-crumb/bread-crumb";
import TabSelector from "@/app/components/interventions/details/tab-selector";
import DeleteIntervention from "@/app/components/interventions/details/delete-intervention";
import DogsNPersons from "@/app/components/interventions/details/tab-dogs-and-persons";
import InterventionDay from "@/app/components/interventions/details/tab-intervention-day";
import type { ApiResponse } from "@/app/components/interventions/details/types";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <h3
        className="text-xs mb-1"
        style={{ fontFamily: "Archivo, sans-serif" }}
      >
        {titulo}
      </h3>
      <p className="" style={{ fontFamily: "Archivo, sans-serif" }}>
        {valor}
      </p>
    </div>
  );
}

const tabsTitles = ["Personas y perros", "Día de la intervención"];

export default function IntervencionPage() {
  const [activeTab, setActiveTab] = useState("Personas y perros");
  const [infoIntervention, setInfoIntervention] = useState<ApiResponse>();
  const [interventionName, setInterventionName] = useState<string>("");
  const context = useContext(LoginContext);

  function handleTabChange(tab: string) {
    setActiveTab(tab);
  }

  const fetchDetallesIntervencion = useCallback(
    async (id: string): Promise<ApiResponse> => {
      if (!context) {
        throw new Error("No authentication context available");
      }

      const resp = await fetchWithAuth(
        context,
        `/api/intervention/${id}/details`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(
          `API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`
        );
      }

      const ct = resp.headers.get("content-type") ?? "";
      if (!ct.includes("application/json")) {
        throw new Error("Expected JSON response");
      }

      const body = (await resp.json()) as unknown;
      if (!body || typeof body !== "object") {
        throw new Error("Malformed API response");
      }

      return body as ApiResponse;
    },
    [context]
  );

  const searchParams = useSearchParams();
  const id: string = searchParams.get("id") ?? "";

  useEffect(() => {
    fetchDetallesIntervencion(id)
      .then((pageResult: ApiResponse) => {
        setInfoIntervention(pageResult);
        const date = new Date(pageResult.timeStamp);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()} ${date
          .getHours()
          .toString()
          .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
        setInterventionName(
          `${pageResult.Institucions[0]?.nombre} ${formattedDate}`
        );
      })
      .catch(() => {});
  }, [fetchDetallesIntervencion, id]);

  if (!infoIntervention) {
    return <div>Cargando...</div>;
  }
  return (
    <div className="w-[98%]">
      <CustomBreadCrumb
        link={["/app/admin/intervenciones/listado", "Intervenciones"]}
        current={`${interventionName}`}
        className="mb-8"
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-5xl font-semibold text-[#1B2F13] tracking-[-2.5%] leading-none">
          {`${interventionName}`}
        </h1>
        <Button className="bg-[#5B9B40] hover:bg-green-800 text-white">
          <Pencil className="w-3 h-4 mr-1" />
          Editar
        </Button>
      </div>

      <div className="py-3 flex flex-col gap-4 ">
        <Dato
          titulo="TIPO DE INTERVENCIÓN"
          valor={infoIntervention.tipo ? infoIntervention.tipo : ""}
        />
        {infoIntervention.description && (
          <Dato titulo="DESCRIPCIÓN" valor={infoIntervention.description} />
        )}
      </div>

      <TabSelector Titles={tabsTitles} onTabChange={handleTabChange} />

      <DogsNPersons
        infoIntervention={infoIntervention}
        shown={activeTab === tabsTitles[0]}
      />

      <InterventionDay
        shown={activeTab === tabsTitles[1]}
        patients={infoIntervention.Pacientes || []}
        dogs={infoIntervention.UsrPerroIntervention || []}
        photos={infoIntervention.fotosUrls}
        link={infoIntervention.driveLink ? infoIntervention.driveLink : ""}
      />

      <div className="mt-2">
        <DeleteIntervention interventionId={id} />
      </div>
    </div>
  );
}
