'use client'

import { LoginContext } from "@/app/context/login-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
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
    <>
        <h1
        className="
          w-[1044px] 
          h-[58px] 
          flex 
          justify-between 
          opacity-100 
          font-inter 
          font-bold 
          text-[48px] 
          leading-[120%] 
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
      <div className="opacity-60 pointer-events-none">
        <form className="w-full max-w-[1044px] pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="block text-sm font-medium">Fecha*</h2>
                <input
                  type="date"
                  value={
                    interv?.timeStamp
                      ? new Date(interv.timeStamp).toISOString().split("T")[0]
                      : ""
                  }
                  disabled
                  className="h-[48px] w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <h2 className="block text-sm font-medium">Hora*</h2>
                <input
                  type="time"
                  value={
                    interv?.timeStamp
                      ? new Date(interv.timeStamp)
                          .toISOString()
                          .split("T")[1]
                          .slice(0, 5)
                      : ""
                  }
                  disabled
                  className="h-[48px] w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <h2 className="block text-sm font-medium">
                Cantidad de duplas necesaria*
              </h2>
              <div className="flex items-center gap-2">
                <Button className="!w-[44px] !h-[48px] rounded-[6px] !p-[12px] border bg-[#FFFFFF] flex items-center justify-center gap-[8px]">
                  <Minus className="w-[20px] h-[20px] text-black" />
                </Button>
                <div className="flex items-center justify-center min-w-[3rem] h-[48px] px-3 py-2 text-sm border rounded-md">
                  {interv?.pairsQuantity ?? 0}
                </div>
                <Button className="!w-[44px] !h-[48px] rounded-[6px] !p-[12px] border bg-[#FFFFFF] flex items-center justify-center gap-[8px]">
                  <Plus className="w-[20px] h-[20px] text-black" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="block text-sm font-medium">
                Tipo de Intervención*
              </h2>
              <select
                disabled
                className="h-[48px] w-full border rounded-md px-3 py-2"
              >
                <option>
                  {interv?.tipo
                    ? interv.tipo.charAt(0).toUpperCase() + interv.tipo.slice(1)
                    : ""}
                </option>{" "}
                {/*upper case first letter*/}
              </select>
            </div>
            <div>
              <h2 className="block text-sm font-medium">Institución*</h2>
              <select
                disabled
                className="h-[48px] w-full border rounded-md px-3 py-2"
              >
                <option>{interv?.institutionName ?? "—"}</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}