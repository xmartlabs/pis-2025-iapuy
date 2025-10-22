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

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export default function PerroSanidadFormDialog({ open, onOpenChange }: Props) {
  const [tab, setTab] = React.useState<Tab>("vacuna");
  const context = useContext(LoginContext);
  const sanidadContext = useContext(SanidadContext);

  const vacunaSchema = z.object({
    fechaInVac: z
      .string()
      .min(2, { message: "Debes completar la fecha de vacunación" }),
    marcaInVac: z.string(),
    carnetInVac: z.instanceof(File, {
      message: "Debes adjuntar el carnet de vacuna",
    }),
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

  // Options for selecting a perro when there's no `id` in the URL.
  const [perroOptions, setPerroOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loadingPerroOptions, setLoadingPerroOptions] = useState(false);
  const [perroOptionsError, setPerroOptionsError] = useState<string | null>(
    null
  );
  const [selectedPerroId, setSelectedPerroId] = useState<string>("");

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

      const doFetch = async (withRetry = true): Promise<void> => {
        try {
          const headers: Record<string, string> = {};
          if (context?.tokenJwt)
            headers.Authorization = `Bearer ${context.tokenJwt}`;

          const res = await fetch("/api/perros/options", { headers });

          if (res.status === 401 && withRetry) {
            // try refresh once
            const resp2 = await fetch("/api/auth/refresh", { method: "POST" });
            if (resp2.ok) {
              await doFetch(false);
              return;
            }
            throw new TypeError("Unauthorized");
          }

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

      doFetch(true).catch(() => {});
    }

    fetchPerrosOptions();

    function cleanup() {
      mounted = false;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-return
    return cleanup;
  }, [searchParams, context]);

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

        if (d.carnetInVac) {
          formData.append("carneVacunas", d.carnetInVac);
        }
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

      const res = await fetch("/api/registros-sanidad", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context?.tokenJwt}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        const resp2 = await fetch("/api/auth/refresh", {
          method: "POST",
        });
        if (resp2.ok) {
          return submitHandler(data);
        }
        return;
      }

      if (res.ok) {
        onOpenChange(false);
        form.reset();
        if (sanidadContext) sanidadContext.refresh();
        toast.success(`¡Datos de Sanidad guardados correctamente!`, {
          duration: 5000,
          icon: null,
          className:
            "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md w font-sans font-semibold text-sm leading-5 tracking-normal",
          style: {
            background: "#DEEBD9",
            border: "1px solid #BDD7B3",
            color: "#121F0D",
          },
        });
      } else {
        toast.error(`No se pudo guardar los datos de Sanidad.`, {
          duration: 5000,
          icon: null,
          className:
            "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md w font-sans font-semibold text-sm leading-5 tracking-normal",
          style: {
            background: "#cfaaaaff",
            border: "1px solid #ec0909ff",
            color: "#ec0909ff",
          },
        });
      }
    } catch (error) {
      // reportError is used across the project; preserve original behavior if available.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
              Registrar Sanidad
            </DialogTitle>
            {/* If there's no `id` in the URL, render a select to pick a perro */}
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
                  <div className="flex flex-col gap-2">
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
