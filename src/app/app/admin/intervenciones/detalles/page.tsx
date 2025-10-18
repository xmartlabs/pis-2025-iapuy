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
      const token = context?.tokenJwt;
      const baseHeaders: Record<string, string> = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const triedRefresh = false;

      const resp = await fetch(`/api/intervention/${id}/details`, {
        method: "GET",
        headers: baseHeaders,
      });
      if (!resp.ok && !triedRefresh && resp.status === 401) {
        const resp2 = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { Accept: "application/json" },
        });
        if (resp2.ok) {
          const refreshBody = (await resp2.json().catch(() => null)) as {
            accessToken?: string;
          } | null;

          const newToken = refreshBody?.accessToken ?? null;
          if (newToken) {
            context?.setToken(newToken);
            const retryResp = await fetch(`/api/intervention/${id}/details`, {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${newToken}`,
              },
            });

            return (await retryResp.json()) as Promise<Promise<ApiResponse>>;
          }
        }
      }
      return (await resp.json()) as Promise<ApiResponse>;
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
        {infoIntervention && infoIntervention.description.length > 0 && (
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
