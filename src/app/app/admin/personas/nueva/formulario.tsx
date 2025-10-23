"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MultiSelect } from "@/components/ui/multiselect";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { RegistrarPerro } from "../../perros/registrar-perro";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";

const formSchema = z
  .object({
    nombre: z.stringFormat("nombre", /^[\p{L}]+(?:\s+[\p{L}]+)+$/u, {
      message: "Ingrese nombre completo",
    }),
    rol: z.enum(["admin", "colaborador"]),
    banco: z.string().min(1, {
      message: "Debe ingresar un banco",
    }),
    cuentaBancaria: z.string().min(1, {
      message: "Debe ingresar un número de cuenta",
    }),
    ci: z.stringFormat("ci", /^[0-9]{8}$/, {
      message: "La cédula deben ser 8 dígitos sin puntos ni guión.",
    }),
    celular: z.stringFormat("cel", /^[0-9]{9}$/, {
      message: "Número de teléfono inválido",
    }),
    perros: z.array(z.string()),
    noPerro: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.noPerro && (!data.perros || data.perros.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["perros"],
        message: 'Seleccione algún perro o marque la casilla "No tiene"',
      });
    }
    if (data.noPerro && data.perros && data.perros.length >= 1) {
      ctx.addIssue({
        code: "custom",
        path: ["perros"],
        message: "Si no tiene perros debes deseleccionarlos.",
      });
    }
  });

const perrosSchema = z.object({
  id: z.string(),
  nombre: z.string(),
});
const perrosArraySchema = z.array(perrosSchema);
const perrosEnvelopeSchema = z.object({ data: perrosArraySchema });
const refreshSchema = z.object({ accessToken: z.string() });

type Perro = z.infer<typeof perrosSchema>;
type PerroOption = { value: string; label: string };

type FormValues = z.infer<typeof formSchema>;

function errorToString(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
interface MagicLinkProps{
  showMagicModal:boolean,
  magicLink:string | null,
  setShowMagicModal:React.Dispatch<React.SetStateAction<boolean>>,
}
const MagicLink = ({showMagicModal,magicLink,setShowMagicModal}:MagicLinkProps)=>{
  const router = useRouter();
  const copyToClipboard = (text: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      toast("Link copiado al portapapeles");
    })
    .catch((err) => {
      toast("No se pudo copiar el link", { description: errorToString(err) });
    });
  };
  return(
    <Dialog
      open={showMagicModal}
      onOpenChange={(val) => {
        setShowMagicModal(val);
        if (!val) {
          router.push("/app/admin/personas/listado");
        }
      }}
    >
      <DialogContent className="font-sans w-[423px] h-[296px] gap-6 p-6 opacity-100">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg leading-[100%] tracking-[-0.025em]">
            Persona creada
          </DialogTitle>
          <DialogDescription className="font-normal text-sm leading-5 tracking-normal text-black">
            <span>
            Para que Daniela pueda terminar el registro, enviale este link y decile que cree una contraseña ahí
            </span>
            <br/>
            <br/>
            <span className="break-all underline">
              {magicLink ?? "No hay link disponible"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row !justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setShowMagicModal(false);
              router.push("/app/admin/personas/listado");
            }}
            className="w-[131px] h-[40px] min-w-[80px] rounded-md flex items-center justify-center gap-1 
             border border-[#BDD7B3] text-[#5B9B40] opacity-100 px-3 py-2 bg-white"
          >
            Volver al listado
          </Button>
          {magicLink && (
            <Button
              onClick={() => {
                copyToClipboard(magicLink);
              }}
              className="w-[121px] h-[36px] min-w-[80px] bg-[#5B9B40] text-[#EFF5EC] rounded-md flex items-center justify-center gap-1 opacity-100 px-3 py-2"
            >
              <Copy />
              Copiar link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default function Formulario() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      rol: "admin",
      banco: "",
      cuentaBancaria: "",
      ci: "",
      celular: "",
      perros: [],
      noPerro: false,
    },
  });

  const context = useContext(LoginContext);
  const [listaPerros, setListaPerros] = useState<PerroOption[]>([]);
  const [reload, setReload] = useState(false);
  const [open, setOpen] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [showMagicModal, setShowMagicModal] = useState(false);

  useEffect(() => {
    async function fetchPerrosOptions(): Promise<void> {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);
      const url = `/api/perros?size=-1`;

      try {
        const token = context?.tokenJwt ?? undefined;

        const doFetch = async (authToken?: string) => {
          const resp = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
            signal: controller.signal,
          });
          return resp;
        };

        let resp = await doFetch(token);

        if (resp.status === 401) {
          const refreshResp = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });

          if (refreshResp.ok) {
            const body = (await refreshResp.json().catch(() => null)) as {
              accessToken?: string;
            } | null;
            const newToken = body?.accessToken ?? null;
            if (newToken) {
              context?.setToken(newToken);
              resp = await doFetch(newToken);
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

        const json: unknown = await resp.json();

        const parsed = z
          .union([perrosArraySchema, perrosEnvelopeSchema])
          .parse(json);
        const perros: Perro[] = Array.isArray(parsed) ? parsed : parsed.data;

        const opciones: PerroOption[] = perros.map((p) => ({
          value: p.id,
          label: p.nombre,
        }));
        setListaPerros(opciones);
      } catch (err) {
        toast("Error cargando perros", {
          description: errorToString(err),
          action: {
            label: "Volver",
            onClick: () => {
              router.push("./");
            },
          },
        });
        setListaPerros([]);
      } finally {
        clearTimeout(timeout);
      }
    }

    fetchPerrosOptions().catch((err) => {
      toast("Error cargando perros", {
        description: errorToString(err),
        action: {
          label: "Volver",
          onClick: () => {
            router.push("./");
          },
        },
      });
      setListaPerros([]);
    });
  }, [context, router, reload]);

  const onSubmit = async (values: FormValues) => {
    form.clearErrors();

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    try {
      const token = context?.tokenJwt ?? undefined;
      const url = `/api/users`;

      const doPost = async (authToken?: string) =>
        await fetch(url.toString(), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ ...values, password: "" }),
          signal: controller.signal,
        });

      let res = await doPost(token);

      if (res.status === 401) {
        const refreshResp = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (refreshResp.status === 200) {
          const raw: unknown = await refreshResp.json().catch(() => null);
          const parsed = refreshSchema.safeParse(raw);
          if (parsed.success) {
            const newToken = parsed.data.accessToken;
            context?.setToken(newToken);
            res = await doPost(newToken);
          } else {
            throw new Error();
          }
        } else {
          throw new Error();
        }
      }

      if (res.status === 409) {
        form.setError("ci", {
          type: "conflict",
          message: "El número de cédula ingresado ya está en uso",
        });
        return;
      }

      if (res.status !== 200) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Error ${res.status}: ${res.statusText}`);
      }

      try {
        const mlController = new AbortController();
        const mlTimeout = setTimeout(() => {
          mlController.abort();
        }, 10000);

        const body = { ci: values.ci, nombre: values.nombre };
        const resp = await fetch("/api/magic-link", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(context?.tokenJwt
              ? { Authorization: `Bearer ${context.tokenJwt}` }
              : {}),
          },
          body: JSON.stringify(body),
          signal: mlController.signal,
        });

        clearTimeout(mlTimeout);

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(txt || `Error ${resp.status}: ${resp.statusText}`);
        }

        const ct = resp.headers.get("content-type") ?? "";
        if (!ct.includes("application/json"))
          throw new Error("Expected JSON response from magic-link");

        const raw: unknown = await resp.json().catch(() => null);
        const parsed = z
          .object({ magicLink: z.string().optional() })
          .safeParse(raw);
        if (parsed.success && parsed.data.magicLink) {
          setMagicLink(parsed.data.magicLink);
          setShowMagicModal(true);
        } else {
          throw new Error(
            "Respuesta inválida del servidor al solicitar magic link"
          );
        }
      } catch (err) {
        toast("No se pudo generar el magic link", {
          description: errorToString(err),
        });
      }
    } catch (err) {
      toast("Error creando usuario", {
        description: err instanceof Error ? err.message : String(err),
        action: {
          label: "Volver",
          onClick: () => {
            router.push("./");
          },
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  };
  const handlePerroCreated = (p: { id: string; nombre: string }) => {
    setListaPerros((prev) => {
      if (prev.some((o) => o.value === p.id)) return prev;
      return [...prev, { value: p.id, label: p.nombre }];
    });

    const current = form.getValues("perros") ?? [];
    if (!current.includes(p.id)) {
      form.setValue("perros", [...current, p.id], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            form
              .handleSubmit(onSubmit)(e)
              .catch((err) => {
                toast("Error creando usuario", {
                  description: err instanceof Error ? err.message : String(err),
                  action: {
                    label: "Volver",
                    onClick: () => {
                      router.push("./");
                    },
                  },
                });
              });
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="md:col-span-3 flex flex-col md:flex-row items-start md:items-center gap-6">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">
                    Nombre y apellido*
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="w-[350px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rol"
              render={({ field }) => (
                <FormItem className="pt-[3%] pb-[3%] h-4/6 mb-[1.5rem]">
                  <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">
                    Rol*
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="admin" />
                        </FormControl>
                        <FormLabel>Administrador</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="colaborador" />
                        </FormControl>
                        <FormLabel>Colaborador</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="banco"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">
                  Banco*
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cuentaBancaria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">
                  Número de cuenta*
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ci"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">
                  Cédula de identidad*
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="celular"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">
                  Celular*
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <div className="flex items-start gap-4 w-10/16">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="perros"
                  render={({ field }) => {
                    const noTiene = form.watch("noPerro");
                    return (
                      <FormItem>
                        <FormLabel
                          className={`font-sans font-medium text-sm leading-5 ${
                            noTiene ? "opacity-50" : ""
                          }`}
                        >
                          Perro
                        </FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={listaPerros}
                            selected={field.value ?? []}
                            onChange={field.onChange}
                            placeholder=""
                            disabled={!!noTiene}
                            createLabel="Agregar perro"
                            onCreate={() => {
                              setOpen(true);
                            }}
                            className="min-w-[240px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <div className="shrink-0">
                <FormField
                  control={form.control}
                  name="noPerro"
                  render={({ field }) => (
                    <FormItem>
                      {/* h-10 = misma altura que el input => centra verticalmente */}
                      <div className="flex items-center h-10 gap-2 mt-[22px]">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(v: boolean) => {
                              field.onChange(v);
                              if (v) {
                                form.setValue("perros", [], {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              }
                            }}
                          />
                        </FormControl>
                        <span className="m-0 whitespace-nowrap text-sm">
                          No tiene
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <Button
            className="max-w-[122px] h-[40px] min-w-[80px] 
                                    gap-1 rotate-0 
                                    pt-2 pr-3 pb-2 pl-3
                                    rounded-md
                                    bg-[#5B9B40]
                                    opacity-50"
            type="submit"
          >
            Crear persona
          </Button>
        </form>
        <RegistrarPerro
          reload={reload}
          setReload={setReload}
          open={open}
          setOpen={setOpen}
          onCreated={handlePerroCreated}
          ownerRequired={false}
          ownerDisabled={true}
        />
      </Form>
      <MagicLink showMagicModal={showMagicModal} magicLink={magicLink} setShowMagicModal={setShowMagicModal}></MagicLink>      
    </>
  );
}
