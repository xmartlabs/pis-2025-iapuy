"use client";

import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoginContext } from "@/app/context/login-context";
import { SanidadContext } from "@/app/context/sanidad-context";
import { useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly costId: string;
  readonly onEdited: () => void;
};

export default function SeeOrEditCost({
  open,
  onOpenChange,
  costId,
  onEdited,
}: Props) {
  const [tab, setTab] = React.useState<Tab>("vacuna");
  const context = useContext(LoginContext)!;
  const sanidadContext = useContext(SanidadContext);

  const vacunaSchema = z.object({
    fechaInVac: z
      .string()
      .min(2, { message: "Debes completar la fecha de vacunación" }),
    marcaInVac: z.string(),
    carnetInVac: z.instanceof(File).optional(),
  });

  const banioSchema = z.object({
    fechaInBanio: z
      .string()
      .min(2, { message: "Debes completar la fecha del baño" }),
  });

  const desparasitacionSchema = z.object({
    desparasitacionTipo: z.enum(["Interna", "Externa"]),
    fechaInDes: z
      .string()
      .min(2, { message: "Debes completar la fecha de desparasitación." }),
    marcaInDes: z.string(),
  });

  const schemaPorTab = {
    vacuna: vacunaSchema,
    banio: banioSchema,
    desparasitacion: desparasitacionSchema,
  } as const;

  type Tab = keyof typeof schemaPorTab;

  type FormValuesVacuna = z.infer<typeof vacunaSchema>;
  type FormValuesBanio = z.infer<typeof banioSchema>;
  type FormValuesDesparasitacion = z.infer<typeof desparasitacionSchema>;

  type FormValues = FormValuesVacuna &
    FormValuesBanio &
    FormValuesDesparasitacion;

  const form = useForm<FormValues>({
    resolver: zodResolver(schemaPorTab[tab]) as unknown as Resolver<FormValues>,
    defaultValues: {
      fechaInVac: "",
      marcaInVac: "",
      carnetInVac: undefined,
      fechaInBanio: "",
      desparasitacionTipo: "Interna",
      fechaInDes: "",
      marcaInDes: "",
    },
  });

  const searchParams = useSearchParams();

  const [perroOptions, setPerroOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loadingPerroOptions, setLoadingPerroOptions] = useState(false);
  const [perroOptionsError, setPerroOptionsError] = useState<string | null>(
    null
  );
  const [selectedPerroId, setSelectedPerroId] = useState<string>("");
  const [eventoId, setEventoId] = useState<string | undefined>(undefined);
  const [existingCarnetUrl, setExistingCarnetUrl] = useState<
    string | undefined
  >(undefined);
  const [existingCarnetName, setExistingCarnetName] = useState<
    string | undefined
  >(undefined);

  // Create an object URL from raw bytes and try to infer MIME type so the
  // browser can render the file instead of displaying garbled text.
  function createObjectUrlFromBytes(byteArray: Uint8Array) {
    let mime = "application/octet-stream";
    let ext = "bin";
    try {
      if (byteArray.length >= 4) {
        const b0 = byteArray[0];
        const b1 = byteArray[1];
        const b2 = byteArray[2];
        const b3 = byteArray[3];
        // PDF: %PDF
        if (b0 === 0x25 && b1 === 0x50 && b2 === 0x44 && b3 === 0x46) {
          mime = "application/pdf";
          ext = "pdf";
        } else if (b0 === 0xff && b1 === 0xd8 && b2 === 0xff) {
          // JPEG
          mime = "image/jpeg";
          ext = "jpg";
        } else if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47) {
          // PNG
          mime = "image/png";
          ext = "png";
        } else if (b0 === 0x47 && b1 === 0x49 && b2 === 0x46 && b3 === 0x38) {
          // GIF87a/89a
          mime = "image/gif";
          ext = "gif";
        }
      }
    } catch {
      // fallback
    }

    // convert to a clean ArrayBuffer slice matching the view
    const ab = byteArray.buffer.slice(
      byteArray.byteOffset,
      byteArray.byteOffset + byteArray.byteLength
    );
    const abBuf = ab as unknown as ArrayBuffer;
    const blob = new Blob([abBuf], { type: mime });
    const url = URL.createObjectURL(blob);
    return { url, mime, ext };
  }

  useEffect(() => {
    const urlId = searchParams.get("id");
    // Only fetch options when there's no id in the URL (per requirement)
    if (urlId) {
      // if id present in URL, keep it as selected value
      setSelectedPerroId(urlId);
      return;
    }

    let mounted = true;

    function fetchPerrosOptions() {
      setLoadingPerroOptions(true);
      setPerroOptionsError(null);

      type PerroApi = {
        id?: string | number;
        value?: string | number;
        _id?: string | number;
        key?: string | number;
        name?: string;
        nombre?: string;
        label?: string;
        nombreCompleto?: string;
      };

      const doFetch = async (): Promise<void> => {
        try {
          const res = await fetchWithAuth(context, "/api/perros/options", {
            headers: {
              Accept: "application/json",
            },
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(text || `Error ${res.status}`);
          }

          const json: unknown = await res.json();

          if (!Array.isArray(json)) {
            throw new TypeError("Respuesta inválida del servidor");
          }

          const mapped: Array<{ id: string; name: string }> = json.map(
            (it: PerroApi) => {
              const id = String(it.id ?? it.value ?? it._id ?? it.key ?? "");
              const name = String(
                it.name ??
                  it.nombre ??
                  it.label ??
                  it.nombreCompleto ??
                  id ??
                  ""
              );
              return { id, name };
            }
          );

          if (mounted) {
            setPerroOptions(mapped);
            if (mapped.length > 0)
              setSelectedPerroId((prev) => prev || mapped[0].id);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (mounted) setPerroOptionsError(msg);
        } finally {
          if (mounted) setLoadingPerroOptions(false);
        }
      };

      doFetch().catch(() => {});
    }

    fetchPerrosOptions();

    function cleanup() {
      mounted = false;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-return
    return cleanup;
  }, [searchParams, context]);

  // helper to format an ISO date (or other date string) to yyyy-mm-dd for input[type=date]
  function formatDateForInput(dateStr: string | undefined | null) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }

  useEffect(() => {
    if (!costId || !open) return;

    let mounted = true;
    const doFetch = async (): Promise<void> => {
      try {
        const res = await fetchWithAuth(
          context,
          `/api/expenses/details?id=${encodeURIComponent(costId)}`,
          { headers: { Accept: "application/json" } }
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Error ${res.status}`);
        }

        const json = (await res.json()) as unknown;
        if (typeof json === "object" && json !== null) {
          const maybe = json as Record<string, unknown>;
          if ("error" in maybe && maybe.error !== null) {
            const errVal = maybe.error;
            const errMsg =
              typeof errVal === "string" ? errVal : JSON.stringify(errVal);
            throw new Error(errMsg);
          }
        }

        const payload = json as {
          expense?: unknown;
          registroSanidad?: { perroId?: string } | null;
          event?: {
            id?: string;
            kind?: string;
            data?: Record<string, unknown>;
          } | null;
        };

        if (!mounted) return;

        if (payload.registroSanidad?.perroId) {
          setSelectedPerroId(String(payload.registroSanidad.perroId));
        }

        const event = payload.event;
        const defaults: Partial<FormValues> = {
          fechaInVac: "",
          marcaInVac: "",
          fechaInBanio: "",
          desparasitacionTipo: "Interna",
          fechaInDes: "",
          marcaInDes: "",
        };
        const data: Record<string, unknown> = (event && event.data) || {};

        if (event?.kind === "vacuna") {
          setTab("vacuna");
          const fechaVal = data.fecha;
          const fechaStr =
            typeof fechaVal === "string"
              ? fechaVal
              : fechaVal instanceof Date
              ? fechaVal.toISOString()
              : undefined;
          defaults.fechaInVac = formatDateForInput(fechaStr);
          defaults.marcaInVac = (data.vac as string) ?? "";

          try {
            const fromServer = data.carneVacunasBase64;
            if (typeof fromServer === "string" && fromServer.length > 0) {
              const base64 = fromServer;
              const byteChars = atob(base64);
              const byteNumbers = new Array(byteChars.length);
              for (let i = 0; i < byteChars.length; i++) {
                byteNumbers[i] = byteChars.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const { url, ext } = createObjectUrlFromBytes(byteArray);
              setExistingCarnetUrl(url);
              setExistingCarnetName(`carnet_vacunas.${ext}`);
            } else {
              const maybe = data.carneVacunas;
              if (typeof maybe === "string" && maybe.length > 0) {
                const base64 = maybe.startsWith("data:")
                  ? maybe.split(",")[1]
                  : maybe;
                const byteChars = atob(base64);
                const byteNumbers = new Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                  byteNumbers[i] = byteChars.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const { url, ext } = createObjectUrlFromBytes(byteArray);
                setExistingCarnetUrl(url);
                setExistingCarnetName(`carnet_vacunas.${ext}`);
              } else if (maybe && typeof maybe === "object") {
                const arr = Array.isArray(maybe)
                  ? (maybe as unknown[])
                  : ((maybe as { data?: unknown }).data as unknown[] | null) ?? null;
                if (Array.isArray(arr) && arr.length > 0) {
                  const byteArray = new Uint8Array(arr as number[]);
                  const { url, ext } = createObjectUrlFromBytes(byteArray);
                  setExistingCarnetUrl(url);
                  setExistingCarnetName(`carnet_vacunas.${ext}`);
                } else {
                  setExistingCarnetUrl(undefined);
                  setExistingCarnetName(undefined);
                }
              } else {
                setExistingCarnetUrl(undefined);
                setExistingCarnetName(undefined);
              }
            }
          } catch {
            setExistingCarnetUrl(undefined);
            setExistingCarnetName(undefined);
          }
        } else if (event?.kind === "banio") {
          setTab("banio");
          const fechaVal = data.fecha;
          const fechaStr =
            typeof fechaVal === "string"
              ? fechaVal
              : fechaVal instanceof Date
              ? fechaVal.toISOString()
              : undefined;
          defaults.fechaInBanio = formatDateForInput(fechaStr);
        } else if (event?.kind === "desparasitacion") {
          setTab("desparasitacion");
          const fechaVal = data.fecha;
          const fechaStr =
            typeof fechaVal === "string"
              ? fechaVal
              : fechaVal instanceof Date
              ? fechaVal.toISOString()
              : undefined;
          defaults.fechaInDes = formatDateForInput(fechaStr);
          defaults.marcaInDes = (data.medicamento as string) ?? "";
          const tipo = (data.tipoDesparasitacion as string) ?? "Interna";
          defaults.desparasitacionTipo =
            tipo === "Externa" ? "Externa" : "Interna";
        }

        let resolvedEventId: string | undefined = undefined;
        if (event && typeof event.id === "string") resolvedEventId = event.id;
        const eventData: Record<string, unknown> = (event && event.data) || {};
        if (!resolvedEventId && eventData && typeof eventData === "object") {
          const getProp = (o: Record<string, unknown>, k: string) => o[k];
          const possible =
            getProp(eventData, "id") ??
            getProp(eventData, "vacunaId") ??
            getProp(eventData, "banioId") ??
            getProp(eventData, "desparasitacionId");
          if (typeof possible === "string" || typeof possible === "number")
            resolvedEventId = String(possible);
        }
        if (
          !resolvedEventId &&
          payload.expense &&
          typeof payload.expense === "object"
        ) {
          const exp = payload.expense as Record<string, unknown>;
          const sanId = exp.sanidadId ?? exp.sanidad_id;
          if (typeof sanId === "string" || typeof sanId === "number")
            resolvedEventId = String(sanId);
        }
        setEventoId(resolvedEventId);

        form.reset(defaults as unknown as FormValues);

        try {
          if (defaults.fechaInVac !== undefined)
            form.setValue("fechaInVac", defaults.fechaInVac || "");
          if (defaults.marcaInVac !== undefined)
            form.setValue("marcaInVac", defaults.marcaInVac || "");
          if (defaults.fechaInBanio !== undefined)
            form.setValue("fechaInBanio", defaults.fechaInBanio || "");
          if (defaults.desparasitacionTipo !== undefined) {
            const validTipo =
              defaults.desparasitacionTipo === "Externa" ? "Externa" : "Interna";
            form.setValue("desparasitacionTipo", validTipo);
          }
          if (defaults.fechaInDes !== undefined)
            form.setValue("fechaInDes", defaults.fechaInDes || "");
          if (defaults.marcaInDes !== undefined)
            form.setValue("marcaInDes", defaults.marcaInDes || "");
        } catch {
          // ignorar errores de setValue
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (mounted) {
          toast.error(msg);
        }
      }
    };

    doFetch().catch(() => {});

    // eslint-disable-next-line @typescript-eslint/consistent-return
    return () => {
      mounted = false;
    };
  }, [costId, open, context, form]);

  // eslint-disable-next-line @typescript-eslint/consistent-return
  async function submitHandler(
    data:
      | z.infer<typeof vacunaSchema>
      | z.infer<typeof banioSchema>
      | z.infer<typeof desparasitacionSchema>
  ) {
    try {
      const formData = new FormData();

      const urlId = searchParams.get("id") ?? "";
      const finalPerroId = selectedPerroId || urlId;

      if (!finalPerroId) {
        toast.error("Debes seleccionar un perro antes de continuar.");
        return;
      }

      if (tab === "vacuna") {
        const d = data as z.infer<typeof vacunaSchema>;
        formData.append("tipoSanidad", "vacuna");
        formData.append("perroId", finalPerroId);
        formData.append("fecha", d.fechaInVac);
        formData.append("vac", d.marcaInVac ?? "");
        formData.append("medicamento", "");
        formData.append("tipoDesparasitacion", "Externa");
        if (d.carnetInVac) formData.append("carneVacunas", d.carnetInVac);
      } else if (tab === "banio") {
        const d = data as z.infer<typeof banioSchema>;
        formData.append("tipoSanidad", "banio");
        formData.append("perroId", finalPerroId);
        formData.append("fecha", d.fechaInBanio);
        formData.append("vac", "");
        formData.append("medicamento", "");
        formData.append("tipoDesparasitacion", "Externa");
      } else {
        const d = data as z.infer<typeof desparasitacionSchema>;
        formData.append("tipoSanidad", "desparasitacion");
        formData.append("perroId", finalPerroId);
        formData.append("fecha", d.fechaInDes);
        formData.append("vac", "");
        formData.append("medicamento", d.marcaInDes);
        formData.append("tipoDesparasitacion", d.desparasitacionTipo);
      }

      if (!eventoId) {
        toast.error(
          "No se pudo determinar el id del evento de sanidad. No se puede editar."
        );
        return;
      }

      formData.append("eventoId", eventoId);

      const res = await fetchWithAuth(context, "/api/registros-sanidad", {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        onOpenChange(false);
        form.reset();
        sanidadContext?.refresh();
        toast.success("¡Datos de Sanidad guardados correctamente!", {
          duration: 5000,
          icon: null,
          className:
            "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md font-sans font-semibold text-sm leading-5 tracking-normal",
          style: {
            background: "#DEEBD9",
            border: "1px solid #BDD7B3",
            color: "#121F0D",
          },
        });
        onEdited();
      } else {
        toast.error("No se pudo guardar los datos de Sanidad.", {
          duration: 5000,
          icon: null,
          className:
            "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md font-sans font-semibold text-sm leading-5 tracking-normal",
          style: {
            background: "#cfaaaaff",
            border: "1px solid #ec0909ff",
            color: "#ec0909ff",
          },
        });
      }
    } catch (error) {
      reportError(error);
    }
  }

  return (
    <div className="font-sans">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogContent className="!w-[422px] max-h-[90vh] !h-auto overflow-visible flex flex-col !pb-0">
          <DialogHeader className="!w-full  !items-center !m-0 shrink-0">
            <DialogTitle className="!font-semibold !text-lg !leading-[100%] !tracking-[-0.025em] !text-left !w-full">
              Editar Registro de Sanidad
            </DialogTitle>
            {!searchParams.get("id") && (
              <div className="mt-3">
                {loadingPerroOptions ? (
                  <div className="text-sm text-gray-500">
                    Cargando perros...
                  </div>
                ) : perroOptionsError ? (
                  <div className="text-sm text-red-500">
                    Error cargando perros: {perroOptionsError}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <label
                      htmlFor="perroSelect"
                      className="text-sm font-medium"
                    >
                      Seleccionar perro
                    </label>
                    <Select
                      value={selectedPerroId}
                      onValueChange={(v) => {
                        setSelectedPerroId(v);
                      }}
                    >
                      <SelectTrigger id="perroSelect" className="!w-full !h-10">
                        <SelectValue placeholder="-- Selecciona --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {perroOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </DialogHeader>
          <Form {...form}>
            <div className="flex flex-col h-auto">
              <div className="flex-1 overflow-y-auto max-h-[60vh]">
                <form
                  id="sanidadForm"
                  onSubmit={(e) => {
                    e.preventDefault();
                    form
                      .handleSubmit(submitHandler)(e)
                      .catch((err) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        reportError(err);
                      });
                  }}
                >
                  <Tabs
                    defaultValue="regSanidad"
                    className="!rounded-md !w-full"
                    value={tab}
                    onValueChange={(newTab) => {
                      setTab(newTab as Tab);
                    }}
                  >
                    <TabsList className="!w-[266px] bg-[#DEEBD9] !rounded-md !p-1 !radius flex items-center justify-between !gap-0">
                      <TabsTrigger
                        value="vacuna"
                        disabled={tab !== "vacuna"}
                        className="flex-1 !gap-0 !w-[72px] !gap-0 !pt-1.5 !pr-3 !pb-1.5 !pl-3
                                    data-[state=active]:bg-white data-[state=active]:text-black 
                                    data-[state=inactive]:text-[#5B9B40]
                                    !rounded-md
                                    font-medium text-sm leading-5 tracking-normal text-center"
                      >
                        Vacuna
                      </TabsTrigger>
                      <TabsTrigger
                        value="banio"
                        disabled={tab !== "banio"}
                        className="flex-1 !gap-0 !pt-1.5 !pr-3 !pb-1.5 !pl-3
                                  data-[state=active]:bg-white data-[state=active]:text-black 
                                  data-[state=inactive]:text-[#5B9B40]
                                  !rounded-md
                                  font-medium text-sm leading-5 tracking-normal text-center"
                      >
                        Baño
                      </TabsTrigger>
                      <TabsTrigger
                        value="desparasitacion"
                        disabled={tab !== "desparasitacion"}
                        className="flex-1 !gap-0 !pt-1.5 !pr-3 !pb-1.5 !pl-3
                                  data-[state=active]:bg-white data-[state=active]:text-black 
                                  data-[state=inactive]:text-[#5B9B40]
                                  !rounded-md
                                  font-medium text-sm leading-5 tracking-normal text-center"
                      >
                        Desparasitación
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="vacuna">
                      <Card className="!border-none !shadow-none">
                        <CardContent className="grid gap-6 !pb-6 !px-0">
                          <FormField
                            control={form.control}
                            name="fechaInVac"
                            render={({ field }) => (
                              <FormItem className="grid gap-2">
                                <FormLabel htmlFor="fechaInVac">
                                  Fecha*
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    id="fechaInVac"
                                    type="date"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="marcaInVac"
                            render={({ field }) => (
                              <FormItem className="grid gap-2">
                                <FormLabel htmlFor="marcaInVac">
                                  Marca
                                </FormLabel>
                                <FormControl>
                                  <Input id="marcaInVac" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="carnetInVac"
                            render={({ field }) => {
                              const filename =
                                (field.value as File | null)?.name ??
                                existingCarnetName ??
                                "Nada cargado todavía";

                              return (
                                <FormItem>
                                  <FormLabel>Carnet de vacuna*</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center w-full border border-gray-200 rounded-md overflow-hidden">
                                      <label
                                        htmlFor="carnetInVac"
                                        className="flex-shrink-0 px-4 py-2 select-none cursor-pointer text-sm font-medium"
                                        aria-hidden={false}
                                      >
                                        <input
                                          id="carnetInVac"
                                          type="file"
                                          className="sr-only"
                                          onChange={(e) => {
                                            const file =
                                              e.target.files?.[0] ?? null;
                                            field.onChange(file);
                                          }}
                                        />
                                        <span>Adjuntar archivo</span>
                                      </label>

                                      <div
                                        className="flex-1 px-3 py-2 text-sm text-gray-500 truncate"
                                        aria-live="polite"
                                      >
                                        {filename}
                                      </div>
                                      {existingCarnetUrl &&
                                        !(field.value as File | null) && (
                                          <div className="pr-3">
                                            <Button
                                              variant="ghost"
                                              onClick={() => {
                                                window.open(
                                                  existingCarnetUrl,
                                                  "_blank"
                                                );
                                              }}
                                            >
                                              Ver carnet
                                            </Button>
                                          </div>
                                        )}
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="banio">
                      <Card className="!border-none !shadow-none">
                        <CardContent className="grid gap-6 !pb-6 !px-0">
                          <FormField
                            control={form.control}
                            name="fechaInBanio"
                            render={({ field }) => (
                              <FormItem className="grid gap-2">
                                <FormLabel htmlFor="fechaInBanio">
                                  Fecha*
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    id="fechaInBanio"
                                    type="date"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="desparasitacion">
                      <Card className="!border-none !shadow-none !pb-6 !pt-4">
                        <CardContent className="grid gap-6 !pb-6 !px-0">
                          <FormField
                            control={form.control}
                            name="desparasitacionTipo"
                            render={({ field }) => (
                              <FormItem className="flex gap-4">
                                <RadioGroup
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  defaultValue="interna"
                                  className="flex gap-4"
                                >
                                  <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                      value="Interna"
                                      id="r1"
                                      className="
                                                              !bg-white !border-2 !border-[#5B9B40] !rounded-full
                                                              data-[state=checked]:!border-[#5B9B40]
                                                              data-[state=checked]:!text-[#5B9B40]
                                                              data-[state=checked]:[&>span>svg]:!fill-[#5B9B40]
                                                              data-[state=checked]:[&>span>svg]:!stroke-[#5B9B40]
                                                          "
                                    />
                                    <Label htmlFor="r1">Interna</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                      value="Externa"
                                      id="r2"
                                      className="
                                                              !bg-white !border-2 !border-[#5B9B40] !rounded-full
                                                              data-[state=checked]:!border-[#5B9B40]
                                                              data-[state=checked]:!text-[#5B9B40]
                                                              data-[state=checked]:[&>span>svg]:!fill-[#5B9B40]
                                                              data-[state=checked]:[&>span>svg]:!stroke-[#5B9B40]
                                                          "
                                    />
                                    <Label htmlFor="r2">Externa</Label>
                                  </div>
                                </RadioGroup>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="fechaInDes"
                            render={({ field }) => (
                              <FormItem className="grid gap-2">
                                <FormLabel htmlFor="fechaInDes">
                                  Fecha*
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    id="fechaInDes"
                                    type="date"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="marcaInDes"
                            render={({ field }) => (
                              <FormItem className="grid gap-2">
                                <FormLabel htmlFor="marcaInDes">
                                  Marca
                                </FormLabel>
                                <FormControl>
                                  <Input id="marcaInDes" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </form>
              </div>
              <DialogFooter className="!w-full !flex flex-row !items-center !justify-between gap-3 mt-2 !pb-6">
                <DialogClose asChild>
                  <Button
                    onClick={() => {
                      form.reset();
                    }}
                    variant="outline"
                    className="
                              !w-[96px] h-10 text-sm px-3 rounded-md
                              border-[#5B9B40] text-[#5B9B40] bg-white
                              hover:bg-[#edd4d1] hover:text-[#bd2717] 
                              hover:border-[#bd2717] transition-colors
                              "
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  form="sanidadForm"
                  type="submit"
                  className="
                            !w-[96px] h-10 text-sm px-3 rounded-md
                            !font-sans !font-medium text-sm !leading-6 
                            !tracking-normal !px-3 !rounded-md !bg-[#5B9B40] 
                            !text-white hover:bg-[#4b8034] transition-colors
                            "
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
