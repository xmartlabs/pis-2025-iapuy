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
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly eventoId: string;
  readonly eventType: string;
  readonly onEdited: () => void;
};

// helper to format an ISO date (or other date string) to yyyy-mm-dd for input[type=date]
function formatDateForInput(dateStr: string | undefined | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// Create an object URL from raw bytes and try to infer MIME type
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

  const ab = byteArray.buffer.slice(
    byteArray.byteOffset,
    byteArray.byteOffset + byteArray.byteLength
  );
  const abBuf = ab as unknown as ArrayBuffer;
  const blob = new Blob([abBuf], { type: mime });
  const url = URL.createObjectURL(blob);
  return { url, mime, ext };
}

export default function EditarSanidadDialog({
  open,
  onOpenChange,
  eventoId,
  eventType,
  onEdited,
}: Props) {
  const [tab, setTab] = React.useState<Tab>("vacuna");
  const context = useContext(LoginContext)!;
  const sanidadContext = useContext(SanidadContext);
  const [loading, setLoading] = useState(false);
  const [existingCarnetUrl, setExistingCarnetUrl] = useState<
    string | undefined
  >(undefined);
  const [existingCarnetName, setExistingCarnetName] = useState<
    string | undefined
  >(undefined);

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

  useEffect(() => {
    if (!eventoId || !eventType || !open) return;

    const doFetch = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(
          context,
          `/api/registros-sanidad/${encodeURIComponent(
            eventoId
          )}?type=${encodeURIComponent(eventType)}`,
          { headers: { Accept: "application/json" } }
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Error ${res.status}`);
        }

        const json = (await res.json()) as unknown;

        const defaults: Partial<FormValues> = {
          fechaInVac: "",
          marcaInVac: "",
          fechaInBanio: "",
          desparasitacionTipo: "Interna",
          fechaInDes: "",
          marcaInDes: "",
        };

        const t = String(eventType ?? "").toLowerCase();

        if (t.includes("vacuna")) {
          setTab("vacuna");
          const vacuna = json as {
            id?: string;
            fecha?: string;
            vac?: string;
            carneVacunas?: unknown;
          } | null;
          defaults.fechaInVac = formatDateForInput(vacuna?.fecha);
          defaults.marcaInVac = vacuna?.vac ?? "";

          try {
            const carneData = vacuna?.carneVacunas;
            if (carneData && typeof carneData === "object") {
              const arr = Array.isArray(carneData)
                ? (carneData as unknown[])
                : ((carneData as { data?: unknown }).data as
                    | unknown[]
                    | null) ?? null;
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
          } catch {
            setExistingCarnetUrl(undefined);
            setExistingCarnetName(undefined);
          }
        } else if (
          t.includes("ba") ||
          t.includes("baño") ||
          t.includes("banio")
        ) {
          setTab("banio");
          const banio = json as { id?: string; fecha?: string } | null;
          defaults.fechaInBanio = formatDateForInput(banio?.fecha);
        } else if (t.includes("despar")) {
          setTab("desparasitacion");
          const despar = json as {
            id?: string;
            fecha?: string;
            medicamento?: string;
            tipoDesparasitacion?: string;
          } | null;
          defaults.fechaInDes = formatDateForInput(despar?.fecha);
          defaults.marcaInDes = despar?.medicamento ?? "";
          const tipo = despar?.tipoDesparasitacion ?? "Interna";
          defaults.desparasitacionTipo =
            tipo === "Externa" ? "Externa" : "Interna";
        }

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
              defaults.desparasitacionTipo === "Externa"
                ? "Externa"
                : "Interna";
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
        toast.error(`Error cargando datos: ${msg}`);
      } finally {
        setLoading(false);
      }
    };

    doFetch().catch(() => {});
  }, [eventoId, open, context, form, eventType]);

  async function submitHandler(
    data:
      | z.infer<typeof vacunaSchema>
      | z.infer<typeof banioSchema>
      | z.infer<typeof desparasitacionSchema>
  ) {
    try {
      const formData = new FormData();

      if (tab === "vacuna") {
        const d = data as z.infer<typeof vacunaSchema>;
        formData.append("tipoSanidad", "vacuna");
        formData.append("fecha", d.fechaInVac);
        formData.append("vac", d.marcaInVac ?? "");
        formData.append("medicamento", "");
        formData.append("tipoDesparasitacion", "Externa");
        if (d.carnetInVac) formData.append("carneVacunas", d.carnetInVac);
      } else if (tab === "banio") {
        const d = data as z.infer<typeof banioSchema>;
        formData.append("tipoSanidad", "banio");
        formData.append("fecha", d.fechaInBanio);
        formData.append("vac", "");
        formData.append("medicamento", "");
        formData.append("tipoDesparasitacion", "Externa");
      } else {
        const d = data as z.infer<typeof desparasitacionSchema>;
        formData.append("tipoSanidad", "desparasitacion");
        formData.append("fecha", d.fechaInDes);
        formData.append("vac", "");
        formData.append("medicamento", d.marcaInDes);
        formData.append("tipoDesparasitacion", d.desparasitacionTipo);
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
        const errorText = await res.text().catch(() => "");
        toast.error(`No se pudo guardar los datos de Sanidad. ${errorText}`, {
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
      toast.error("Error al guardar los datos de Sanidad", {
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
  }

  return (
    <div className="font-sans">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogContent className="!w-[422px] max-h-[90vh] !h-auto overflow-visible flex flex-col !pb-0">
          <DialogHeader className="!w-full !items-center !m-0 shrink-0">
            <DialogTitle className="!font-semibold !text-lg !leading-[100%] !tracking-[-0.025em] !text-left !w-full">
              Editar Registro de Sanidad
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <div className="flex flex-col h-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-gray-500">Cargando datos...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto max-h-[60vh]">
                  <form
                    id="sanidadForm"
                    onSubmit={(e) => {
                      e.preventDefault();
                      form
                        .handleSubmit(submitHandler)(e)
                        .catch((err) => {
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
                                    <FormLabel>Carnet de vacuna</FormLabel>
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
                                                  globalThis.open(
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
              )}
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
                  disabled={loading}
                  className="
                            !w-[96px] h-10 text-sm px-3 rounded-md
                            !font-sans !font-medium text-sm !leading-6 
                            !tracking-normal !px-3 !rounded-md !bg-[#5B9B40] 
                            !text-white hover:bg-[#4b8034] transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
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
