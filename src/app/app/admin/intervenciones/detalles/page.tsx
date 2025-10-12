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

type ApiResponse = {
  intervention: DetallesIntervencionDto;
  error: string;
  status: number;
};

type dupla = {
  guide: string;
  dog: string;
};

type DetallesIntervencionDto = {
  id: string;
  org: string;
  tipo: string;
  descripcion: string;
  date: string;
  duplas: dupla[];
  companions: string[];
};

const interventionDefault = {
  id: "",
  org: "casmu",
  tipo: "educativa",
  descripcion: "desc",
  date: "11/06/25 15:00",
  duplas: [
    { guide: "Carla Sosa", dog: "Mara" },
    { guide: "Juan Pérez", dog: "Rex" },
  ] as dupla[],
  companions: ["Carla Sosa", "Daniela Nuñez"],
};

const tabsTitles = ["Personas y perros", "Día de la intervención"];

export default function IntervencionPage() {
  const [activeTab, setActiveTab] = useState("Personas y perros");
  const [infoIntervention, setInfoIntervention] = useState(interventionDefault);
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

      // TODO: check correct endpoint when merged to dev
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
        setInfoIntervention(pageResult.intervention || interventionDefault);
      })
      .catch(() => {});
  }, [fetchDetallesIntervencion, id]);

  return (
    <div className="w-[98%]">
      <CustomBreadCrumb
        link={["/app/admin/intervenciones/listado", "Intervenciones"]}
        current={`${infoIntervention.org} ${infoIntervention.date}`}
        className="mb-8"
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-[#1B2F13]">
          {`${infoIntervention.org} ${infoIntervention.date}`}
        </h1>
        <Button className="bg-[#5B9B40] hover:bg-green-800 text-white">
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>

      <div className="py-3 flex flex-col gap-4 ">
        <Dato
          titulo="TIPO DE INTERVENCIÓN"
          valor={infoIntervention.tipo ? infoIntervention.tipo : ""}
        />
        <Dato
          titulo="DESCRIPCIÓN"
          valor={
            infoIntervention.descripcion ? infoIntervention.descripcion : ""
          }
        />
      </div>

      <TabSelector Titles={tabsTitles} onTabChange={handleTabChange} />

      <DogsNPersons
        infoIntervention={infoIntervention}
        shown={activeTab === tabsTitles[0]}
      />

      <InterventionDay
        shown={activeTab === tabsTitles[1]}
        patients={[]}
        dogs={[]}
        link={""}
      />

      <DeleteIntervention />
    </div>
  );
}
