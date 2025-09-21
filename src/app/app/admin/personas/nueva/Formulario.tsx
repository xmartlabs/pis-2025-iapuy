"use client";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { MultiSelect } from "@/components/ui/multiselect";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner"
import { useRouter } from "next/navigation";

const BASE_API_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const formSchema = z.object({
  nombre: z.stringFormat("nombre", /^[\p{L}]+(?:\s+[\p{L}]+)+$/u, {
    message: "Ingrese nombre completo",
  }),
  password: z.string().min(8, {
    message: "Su contraseña debe tener más de 8 caracteres.",
  }),
  rol: z.enum(["admin","colaborador"]),
  banco: z.string().min(1, {
    message: "Debe ingresar un banco"
  }),
  cuentaBancaria: z.string().min(1,{
    message: "Debe ingresar un número de cuenta"
  }),
  ci: z.stringFormat("ci", /^[0-9]{8}$/, {
    message: "La cédula deben ser 8 dígitos sin puntos ni guión."
  }),
  celular: z.stringFormat("cel", /^[0-9]{9}$/, {
    message: "Número de teléfono inválido"
  }),
  perros: z.array(z.string()),
  noPerro: z.boolean(),
}).superRefine((data, ctx) => {
    // Si no está seleccionado que no tiene perros debe seleccionar alguno
    if(!data.noPerro && (!data.perros || data.perros.length === 0)) {
        ctx.addIssue({code: "custom", path: ["perros"], message: "Seleccione algún perro o marque la casilla \"No tiene\""});
    }
    // Si está seleccionado que no tiene perros y hay perros seleccionados igual
    if(data.noPerro && data.perros && data.perros.length >= 1){
        ctx.addIssue({code: "custom", path: ["perros"], message: "Si no tiene perros debes deseleccionarlos."})
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

type FormValues = z.infer<typeof formSchema>

function errorToString(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export default function Formulario() {
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        nombre: "",
        password: "",
        rol: "admin",
        banco: "",
        cuentaBancaria: "",
        ci: "",
        celular: "",
        perros: [],
        noPerro: false,
        },
    })

    const context = useContext(LoginContext);
    const [listaPerros, setListaPerros] = useState<PerroOption[]>([]);

    useEffect(() => {
    async function fetchPerrosOptions(): Promise<void> {
        const controller = new AbortController();
        const timeout = setTimeout(() => { controller.abort(); }, 10000);
        const url = new URL("/api/perros", BASE_API_URL);

        try {
        const token = context?.tokenJwt ?? undefined;

        const doFetch = async (authToken?: string) => {
            const resp = await fetch(url.toString(), {
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
            const refreshResp = await fetch(new URL("/api/auth/refresh", BASE_API_URL), {
            method: "POST",
            headers: { Accept: "application/json" },
            signal: controller.signal,
            });

            if (refreshResp.ok) {
            const body = (await refreshResp.json().catch(() => null)) as { accessToken?: string } | null;
            const newToken = body?.accessToken ?? null;
            if (newToken) {
                context?.setToken(newToken);
                resp = await doFetch(newToken);
            }
            }
        }

        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            throw new Error(`API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`);
        }

        const ct = resp.headers.get("content-type") ?? "";
        if (!ct.includes("application/json")) throw new Error("Expected JSON response");

        const json: unknown = await resp.json();

        const parsed = z.union([perrosArraySchema, perrosEnvelopeSchema]).parse(json);
        const perros: Perro[] = Array.isArray(parsed) ? parsed : parsed.data;

        const opciones: PerroOption[] = perros.map(p => ({ value: p.id, label: p.nombre }));
        setListaPerros(opciones);
        } catch (err) {
            toast("Error cargando perros", {
                description: errorToString(err),
                action: {
                    label: "Volver",
                    onClick: () => { router.push("./") },
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
                onClick: () => { router.push("./") },
            },
        });
        setListaPerros([]);
    });
    }, [context, router]);
    
    const onSubmit = async (values: FormValues) => {
        form.clearErrors();

        // opcional: timeout/abort como en el fetch de perros
        const controller = new AbortController();
        const timeout = setTimeout(() => { controller.abort(); }, 10000);

        try {
            const token = context?.tokenJwt ?? undefined;
            const url = new URL("/api/users", BASE_API_URL);

            const doPost = async (authToken?: string) => await fetch(url.toString(), {
                method: "POST",
                headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
                body: JSON.stringify(values),
                signal: controller.signal,
            });

            // 1er intento con el token actual (si hay)
            let res = await doPost(token);

            // Si expira (401), refrescá y reintentá
            if (res.status === 401) {
                const refreshResp = await fetch(new URL("/api/auth/refresh", BASE_API_URL), {
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

            // Otros errores
            if (res.status !== 200) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || `Error ${res.status}: ${res.statusText}`);
            }

            // Éxito → redirigí
            router.push("./"); // ajustá la ruta si querés
        } catch (err) {
            toast("Error creando usuario", {
                description: err instanceof Error ? err.message : String(err),
                action: {
                    label: "Volver",
                    onClick: () => { router.push("./") },
                },
            });
        } finally {
            clearTimeout(timeout);
        }
        };
    return (
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
                                onClick: () => { router.push("./") },
                            },
                        });
                    })
                }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Nombre*</FormLabel>
                            <FormControl>
                                <Input {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Contraseña*</FormLabel>
                            <FormControl>
                                <Input {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rol"
                    render={({field}) => (
                        <FormItem className="pt-[3%] pb-[3%] h-4/6">
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Rol*</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <FormItem className="flex items-center gap-3">
                                        <FormControl>
                                            <RadioGroupItem value="admin"/>
                                        </FormControl>
                                        <FormLabel>
                                            Administrador
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center gap-3">
                                        <FormControl>
                                            <RadioGroupItem value="colaborador"/>
                                        </FormControl>
                                        <FormLabel>
                                            Colaborador
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="banco"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Banco*</FormLabel>
                            <FormControl>
                                <Input {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cuentaBancaria"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Número de cuenta*</FormLabel>
                            <FormControl>
                                <Input {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="ci"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Cédula de identidad*</FormLabel>
                            <FormControl>
                                <Input {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="celular"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Celular*</FormLabel>
                            <FormControl>
                                <Input {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="perros"
                    render={({ field }) => {
                        const noTiene = form.watch("noPerro") // true/false
                        return (
                        <FormItem>
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">
                            Perro
                            </FormLabel>
                            <FormControl>
                                <MultiSelect
                                    options={listaPerros}
                                    selected={field.value ?? []}
                                    onChange={field.onChange}
                                    placeholder=""
                                    disabled={!!noTiene}
                                    createLabel="+ Agregar perro"
                                    createHref="app/admin/perros/nuevo" // o usa onCreate={() => ...}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )
                    }}
                    />

                    <FormField
                    control={form.control}
                    name="noPerro"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-2 gap-2 p-0 mt-[12.5%] w-2/5 h-1/4 left-[-5%] relative">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={(v: boolean) => {
                                field.onChange(v)
                                if (v) {
                                form.setValue("perros", [], { shouldValidate: true, shouldDirty: true })
                                }
                            }}
                            />
                        </FormControl>
                        <FormLabel className="relative left-[-75%]">No tiene</FormLabel>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <Button className="w-3/6 primary gap-1 pt-2 pr-3 pb-2 pl-3 gap-1 rounded-md" type="submit">Crear persona</Button>
            </form>
        </Form>
    );
}