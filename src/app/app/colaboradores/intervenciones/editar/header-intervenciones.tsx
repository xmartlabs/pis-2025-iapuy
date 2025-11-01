'use client'

import { LoginContext } from "@/app/context/login-context";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";


interface Intervention {
  id: string;
  timeStamp: string;
  status: string;
  pairsQuantity: number;
  tipo: string;
  post_evaluacion: string;
  fotosUrls: string[];
  driveLink: string | null;
  description: string | null;
  userId: string | null;
  institutionName?: string;
}

export default function HeaderIntervenciones({ id }: { id: string | null }) {
    const [interv, setInterv] = useState<Intervention>();
    const context = useContext(LoginContext)!;
  
    useEffect(() => {
      const callApi = async () => {
        try {
          const response = await fetchWithAuth(
            context,
            `/api/intervention/${id}`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            const txt = await response.text().catch(() => "");
            throw new Error(
              `API ${response.status}: ${response.statusText}${txt ? ` - ${txt}` : ""}`
            );
          }

          const ct = response.headers.get("content-type") ?? "";
          if (!ct.includes("application/json")) {
            throw new Error("Expected JSON response");
          }

          const body = (await response.json()) as Intervention;
          setInterv(body);
        } catch (err) {
          reportError(err);
        }
      };
      callApi().catch((err) => {
        reportError(err);
      });
    }, [context, id]);
  return (
    <div className="pb-6 ">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1
              className="
                font-inter font-semibold
                text-[32px] sm:text-[40px] md:text-[48px]
                leading-tight
              "
            >
              {`Editar ${interv?.institutionName ?? ""} ${
                interv?.timeStamp
                  ? new Date(interv.timeStamp).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })
                  : ""
              } ${
                interv?.timeStamp
                  ? new Date(interv.timeStamp).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : ""
              }`}
            </h1>

            <Button
              disabled
              className="
                w-[141px] h-[40px]
                rounded-[6px]
                bg-[#5B9B40] text-white
                flex items-center justify-center
              "
            >
              <span className="font-bold font-sans text-[16px] leading-[24px] tracking-[-0.01em]">
                Guardar cambios
              </span>
            </Button>
        </div>
        <div>
              <div className="max-w-[571] py-6">
                <h2 className="block text-xs font-normal py-1">TIPO DE INTERVENCIÓN</h2>
                  {interv?.tipo? interv.tipo.charAt(0).toUpperCase() + interv.tipo.slice(1): ""} {/*upper case first letter*/}
              </div>
              <div>
                <h2 className="block text-xs font-normal py-1">DESCRIPCIÓN</h2>
                  {interv?.description ?? "—"}
          </div>
        </div>
      </div>
  );
}