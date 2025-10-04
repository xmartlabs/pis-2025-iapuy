"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { set, z } from "zod";
import { useContext, useCallback, useEffect, useState } from "react";
import { LoginContext } from "@/app/context/login-context";
import type { InterventionDto } from "@/app/app/admin/intervenciones/dtos/intervention.dto";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { MinusIcon, PlusIcon } from "lucide-react";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const formSchema = z
  .object({
    date: z
      .string()
      .min(1, { message: "Debe seleccionar una fecha" })
      .refine(
        (dateString) => {
          const selectedDate = new Date(dateString);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          return selectedDate >= today;
        },
        {
          message: "La fecha debe ser hoy o en el futuro",
        }
      ),
    hour: z
      .string()
      .min(1, { message: "Debe seleccionar una hora" })
      .refine(
        (timeString) => {
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          return timeRegex.test(timeString);
        },
        {
          message: "Formato de hora inválido (HH:MM)",
        }
      ),
    pairQuantity: z.number().min(1, { message: "Debe ingresar una cantidad" }),
    type: z.enum(["Educativa", "Recreativa", "Terapeutica"]),
    institution: z.string().min(1, {
      message: "Debe ingresar una institución",
    }),
    description: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.date && data.hour) {
      const selectedDateTime = new Date(`${data.date}T${data.hour}`);
      const now = new Date();

      if (selectedDateTime <= now) {
        ctx.addIssue({
          code: "custom",
          message: "La fecha y hora debe ser en el futuro",
          path: ["hour"],
        });
      }
    }
  });

const institutionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

type Institution = z.infer<typeof institutionSchema>;
type FormValues = z.infer<typeof formSchema>;

export default function NewIntervention() {
  const [error, setError] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<Array<Institution> | null>(
    null
  );
  const context = useContext(LoginContext);
  const router = useRouter();
  const interventionTypes = ["Educativa", "Recreativa", "Terapeutica"];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      hour: "",
      pairQuantity: 1,
      type: "Educativa",
      institution: "",
      description: "",
    },
  });
  const fetchInterventionsByInstitution = useCallback(
    async (
      institutionName: string,
      signal?: AbortSignal,
      triedRefresh = false
    ): Promise<PaginationResultDto<InterventionDto> | null> => {
      const url = new URL("/api/interventions", BASE_API_URL);
      url.searchParams.set("query", institutionName);

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);
      const combinedSignal = signal ?? controller.signal;

      try {
        const token = context?.tokenJwt;

        if (!token) {
          throw new Error("No authentication token available");
        }

        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const resp = await fetch(url.toString(), {
          method: "GET",
          headers: baseHeaders,
          signal: combinedSignal,
        });

        if (!resp.ok && !triedRefresh && resp.status === 401) {
          const resp2 = await fetch(
            new URL("/api/auth/refresh", BASE_API_URL),
            {
              method: "POST",
              headers: { Accept: "application/json" },
              signal: combinedSignal,
            }
          );

          if (resp2.ok) {
            const refreshBody = (await resp2.json().catch(() => null)) as {
              accessToken?: string;
            } | null;

            const newToken = refreshBody?.accessToken ?? null;
            if (newToken) {
              context?.setToken(newToken);
              return await fetchInterventionsByInstitution(
                institutionName,
                signal,
                true
              );
            }
          }
        }

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(
            `API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`
          );
        }

        const ct = resp.headers.get("content-type") ?? "";
        if (!ct.includes("application/json"))
          throw new Error("Expected JSON response");

        const body = (await resp.json()) as unknown;
        if (
          !body ||
          !Array.isArray((body as PaginationResultDto<InterventionDto>).data)
        )
          throw new Error("Malformed API response");

        return body as PaginationResultDto<InterventionDto>;
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
  const onSubmit = async (values: FormValues) => {
    try {
      const token = context?.tokenJwt;

      if (!context) {
        toast("Error: Contexto de autenticación no disponible", {
          description:
            "Por favor, recargue la página e inicie sesión nuevamente.",
        });
        return;
      }

      if (!token) {
        toast("Error: No hay token de autenticación", {
          description: "Por favor, inicie sesión nuevamente.",
        });
        return;
      }

      const combinedDateTime = new Date(`${values.date}T${values.hour}`);

      const backendData = {
        timeStamp: combinedDateTime.toISOString(),
        pairsQuantity: values.pairQuantity,
        tipo: values.type.toLowerCase(),
        institucion: values.institution,
        description: values.description,
        costo: 0,
        fotosUrls: [],
        estado: "pendiente",
      };
      for (const intervention of interventions?.data ?? []) {
        if (
          new Date(intervention.timeStamp).getTime() ===
            combinedDateTime.getTime() &&
          new Date(intervention.timeStamp).getDate() ===
            combinedDateTime.getDate()
        ) {
          setError(
            "Ya existe una intervención para esa institución en la misma fecha y hora."
          );
          return;
        }
      }
      const url = new URL("/api/interventions", BASE_API_URL);

      const doPost = async (authToken: string) => {
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
          authorization: `Bearer ${authToken}`,
        };

        return await fetch(url.toString(), {
          method: "POST",
          headers,
          body: JSON.stringify(backendData),
        });
      };
      let response = await doPost(token);

      if (response.status === 401) {
        const refreshResponse = await fetch(
          new URL("/api/auth/refresh", BASE_API_URL),
          {
            method: "POST",
            headers: { Accept: "application/json" },
          }
        );

        if (refreshResponse.ok) {
          const refreshData = (await refreshResponse
            .json()
            .catch(() => null)) as { accessToken?: string } | null;
          const newToken = refreshData?.accessToken;

          if (newToken && typeof newToken === "string") {
            context?.setToken(newToken);
            response = await doPost(newToken);
          } else {
            throw new Error("No se pudo obtener un nuevo token de acceso");
          }
        } else {
          throw new Error("Error al refrescar la autenticación");
        }
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          errorText || `Error ${response.status}: ${response.statusText}`
        );
      }
      const interventions = await fetchInterventionsByInstitution(
        values.institution
      );

      toast("Intervención creada con éxito", {
        description: "La intervención ha sido creada exitosamente.",
      });
      router.push("/app/admin/intervenciones/listado");
    } catch (err) {
      toast("Error creando intervención", {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };
  const fetchInstitutions = useCallback(
    async (
      signal?: AbortSignal,
      triedRefresh = false
    ): Promise<Array<{ id: string; name: string }> | null> => {
      const url = new URL("/api/instituciones/findall-simple", BASE_API_URL);

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);
      const combinedSignal = signal ?? controller.signal;

      try {
        const token = context?.tokenJwt;

        if (!token) {
          throw new Error("No authentication token available");
        }

        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const resp = await fetch(url.toString(), {
          method: "GET",
          headers: baseHeaders,
          signal: combinedSignal,
        });

        if (!resp.ok && !triedRefresh && resp.status === 401) {
          const resp2 = await fetch(
            new URL("/api/auth/refresh", BASE_API_URL),
            {
              method: "POST",
              headers: { Accept: "application/json" },
              signal: combinedSignal,
            }
          );

          if (resp2.ok) {
            const refreshBody = (await resp2.json().catch(() => null)) as {
              accessToken?: string;
            } | null;

            const newToken = refreshBody?.accessToken ?? null;
            if (newToken) {
              context?.setToken(newToken);
              return await fetchInstitutions(signal, true);
            }
          }
        }

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(
            `API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`
          );
        }

        const ct = resp.headers.get("content-type") ?? "";
        if (!ct.includes("application/json"))
          throw new Error("Expected JSON response");

        const body = (await resp.json()) as unknown;
        if (!body || !Array.isArray(body))
          throw new Error("Malformed API response");

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
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="w-full mb-4 sm:mb-[20px] pt-8 sm:pt-[60px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl leading-none font-semibold tracking-[-0.025em] flex items-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Nueva Intervención
        </h1>
      </div>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form
              .handleSubmit(onSubmit)()
              .catch((err) => {
                toast("Error en el formulario", {
                  description: err instanceof Error ? err.message : String(err),
                });
              });
          }}
          className="w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha*</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora*</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pairQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad de duplas necesaria*</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newValue = Math.max(1, field.value - 1);
                          field.onChange(newValue);
                        }}
                        disabled={field.value <= 1}
                        aria-label="Disminuir cantidad"
                      >
                        <MinusIcon />
                      </Button>
                      <div className="flex items-center justify-center min-w-[3rem] h-10 px-3 py-2 text-sm border border-input bg-background rounded-md">
                        {field.value}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newValue = field.value + 1;
                          field.onChange(newValue);
                        }}
                        aria-label="Aumentar cantidad"
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Intervención*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {interventionTypes.map((type, index) => (
                          <SelectItem key={index} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institución*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una institución" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {institutions && institutions.length > 0 ? (
                          institutions
                            .filter(
                              (inst) => inst?.name && inst.name.trim() !== ""
                            )
                            .map((inst, index) => (
                              <SelectItem key={index} value={inst.name}>
                                {inst.name}
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="no-institutions" disabled>
                            No hay instituciones disponibles
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-start items-center">
            <Button
              type="submit"
              className="text-sm leading-6 medium !bg-[var(--custom-green)] !text-white w-full sm:w-auto"
            >
              Crear Intervención
            </Button>
          </div>
        </form>
      </Form>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
