'use client'

import { LoginContext } from "@/app/context/login-context";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

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
    const context = useContext(LoginContext);
  
    useEffect(() => {
      const callApi = async () => {
        try {
          const token = context?.tokenJwt;
          const baseHeaders: Record<string, string> = {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          };
          const response = await fetch(`/api/intervention/${id}`, {
            headers: baseHeaders,
          });
          if (response.status === 401) {
            const resp2 = await fetch(
              new URL("/api/auth/refresh", BASE_API_URL),
              {
                method: "POST",
                headers: { Accept: "application/json" },
              }
            );
            if (resp2.ok) {
              const refreshBody = (await resp2.json().catch(() => null)) as {
                accessToken?: string;
              } | null;
              const newToken = refreshBody?.accessToken ?? null;
              if (newToken) {
                context?.setToken(newToken);
                const retryResp = await fetch(`/api/intervention/${id}`, {
                  method: "GET",
                  headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${newToken}`,
                  },
                });
                if (!retryResp.ok) {
                  const txt = await retryResp.text().catch(() => "");
                  throw new Error(
                    `API ${retryResp.status}: ${retryResp.statusText}${
                      txt ? ` - ${txt}` : ""
                    }`
                  );
                }
                const ct2 = retryResp.headers.get("content-type") ?? "";
                if (!ct2.includes("application/json"))
                  throw new Error("Expected JSON response");
  
                const body2 = (await retryResp.json()) as Intervention;
                setInterv(body2);
  
                return;
              }
            }
          }
          const datos = (await response.json()) as Intervention;
          const intervData = datos ?? [];
          setInterv(intervData);
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