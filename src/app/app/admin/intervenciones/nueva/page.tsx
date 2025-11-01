"use client";
import { Button } from "@/components/ui/button";
import { useContext, useCallback, useEffect, useState, useRef } from "react";
import { LoginContext } from "@/app/context/login-context";
import type { InterventionDto } from "@/app/app/admin/intervenciones/dtos/intervention.dto";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { AlertCircleIcon } from "lucide-react";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import InterventionRow from "@/app/components/intervenciones/intervention-row";
import NuevaIntervencionForm, {
  type FormValues,
  type NuevaIntervencionFormRef,
} from "@/app/components/intervenciones/form-new-intervention";
import CustomBreadCrumb from "@/app/components/bread-crumb/bread-crumb";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

type Institution = {
  id: string;
  name: string;
};

export default function NewIntervention() {
  const [error, setError] = useState<string | null>(null);
  const [institution, setInstitution] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<Array<Institution> | null>(
    null
  );
  const context = useContext(LoginContext);
  const router = useRouter();
  const [repeatedIntervention, setRepeatedIntervention] =
    useState<InterventionDto | null>(null);
  const [retrying, setRetrying] = useState<boolean>(false);
  const formRef = useRef<NuevaIntervencionFormRef>(null);
  const fetchInterventionsByInstitution = useCallback(
    async (
      institutionName: string,
      signal?: AbortSignal
    ): Promise<PaginationResultDto<InterventionDto> | null> => {
      const url = new URL("/api/intervention", location.origin);
      url.searchParams.set("query", institutionName);

      const controller = signal ? null : new AbortController();
      const combinedSignal = signal ?? controller?.signal;
      const timeout = controller ? setTimeout(() => { controller.abort(); }, 10000) : null;

      try {
        if (!context?.tokenJwt) {
          throw new Error("No authentication token available");
        }

        const resp = await fetchWithAuth(context, url.toString(), {
          method: "GET",
          signal: combinedSignal,
        });

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
        if (
          !body ||
          !Array.isArray((body as PaginationResultDto<InterventionDto>).data)
        ) {
          throw new Error("Malformed API response");
        }

        return body as PaginationResultDto<InterventionDto>;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") {
          return null;
        }
        throw err;
      } finally {
        if (timeout) clearTimeout(timeout);
      }
    },
    [context]
  );
  const onSubmit = async (values: FormValues) => {
    setRepeatedIntervention(null);
    setInstitution(values.institution);

    try {
      if (!context) {
        toast("Error: Contexto de autenticación no disponible", {
          description:
            "Por favor, recargue la página e inicie sesión nuevamente.",
        });
        return;
      }

      if (!context.tokenJwt) {
        toast("Error: No hay token de autenticación", {
          description: "Por favor, inicie sesión nuevamente.",
        });
        return;
      }

      const combinedDateTime = new Date(`${values.date}T${values.hour}`);

      const backendData = {
        timeStamp: combinedDateTime.toISOString(),
        pairsQuantity: values.pairQuantity,
        type: values.type,
        institution: values.institution,
        description: values.description,
        fotosUrls: [],
        state: "Pendiente de asignacion",
      };

      // Verificar si ya existe una intervención en la misma institución y hora
      if (!retrying) {
        const interventions = await fetchInterventionsByInstitution(
          values.institution
        );

        for (const intervention of interventions?.data ?? []) {
          const interventionDate = new Date(intervention.timeStamp);
          if (
            interventionDate.getTime() === combinedDateTime.getTime() &&
            interventionDate.getDate() === combinedDateTime.getDate() &&
            interventionDate.getMonth() === combinedDateTime.getMonth() &&
            interventionDate.getFullYear() === combinedDateTime.getFullYear()
          ) {
            setRepeatedIntervention(intervention);
            setRetrying(true);
            return;
          }
        }
      }

      // --- Usamos fetchWithAuth para el POST ---
      const url = new URL("/api/intervention", location.origin);

      const resp = await fetchWithAuth(context, url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      if (!resp.ok) {
        const errorText = await resp.text().catch(() => "");
        throw new Error(
          errorText || `Error ${resp.status}: ${resp.statusText}`
        );
      }

      setInstitution(null);
      setRetrying(false);
      router.push("/app/admin/intervenciones/listado?success=1");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast("Error creando intervención");
    }
  };
  const fetchInstitutions = useCallback(
    async (
      signal?: AbortSignal
    ): Promise<Array<{ id: string; name: string }> | null> => {
      const url = new URL("/api/instituciones/findall-simple", location.origin);

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);
      const combinedSignal = signal ?? controller.signal;

      try {
        if (!context) {
          throw new Error("No authentication context available");
        }

        const resp = await fetchWithAuth(context, url.toString(), {
          method: "GET",
          signal: combinedSignal,
        });

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
        if (!body || !Array.isArray(body)) {
          throw new Error("Malformed API response");
        }

        return body as Array<{ id: string; name: string }>;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") {
          return null;
        }
        throw err;
      } finally {
        clearTimeout(timeout);
      }
    },
    [context]
  );

  useEffect(() => {
    if (!context?.tokenJwt) {
      setError("Usuario no autenticado. Por favor, inicie sesión.");
      return;
    }

    const controller = new AbortController();

    fetchInstitutions(controller.signal)
      .then((res) => {
        if (res) {
          setInstitutions(res);
          setError(null);
        } else {
          setError("No se pudieron cargar las instituciones.");
        }
      })
      .catch((err) => {
        if (err instanceof Error) {
          setError(`Error al cargar las instituciones`);
        } else {
          setError(
            "Error al cargar las instituciones. Verifique su conexión o autenticación."
          );
        }
      });
  }, [fetchInstitutions, context?.tokenJwt]);
  return (
    <div className="mr-[20px]">
      
      <CustomBreadCrumb link={["/app/admin/intervenciones/listado", "Intervenciones"]} current={"Nueva intervención"} className={"mb-8"}></CustomBreadCrumb>
      <div className="w-full sm:mb-[20px] flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl leading-none font-semibold tracking-[-0.025em]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Nueva Intervención
        </h1>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {repeatedIntervention !== null && institution !== null && (
        <div className="grid border border-red-500 rounded-md p-2 w-full mb-8">
          <div className="flex">
            <AlertCircleIcon className="text-red-500 mr-1" />{" "}
            <p className="text-red-500"> Posible intervención duplicada: </p>
          </div>
          <InterventionRow
            intervention={repeatedIntervention}
            institution={institution}
          />
        </div>
      )}
      <NuevaIntervencionForm
        ref={formRef}
        institutions={institutions || []}
        onSubmit={onSubmit}
      />
      <div className="flex justify-start items-center mt-2">
        <Button
          type="button"
          onClick={() => {
            formRef.current?.submitForm().catch(() => {});
          }}
          className="max-w-[148px] max-h-[40px] min-w-[80px] px-3 py-2
                      flex items-center justify-center gap-1
                      rounded-md
                      bg-[#5B9B40] text-white
                      opacity-50"
        >
          Crear Intervención
        </Button>
      </div>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
