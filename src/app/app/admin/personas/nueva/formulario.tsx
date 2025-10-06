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

import { RegistrarPerro } from "../../perros/registrar-perro";



const formSchema = z.object({
    nombre: z.stringFormat("nombre", /^[\p{L}]+(?:\s+[\p{L}]+)+$/u, {
        message: "Ingrese nombre completo",
    }),
    password: z.string().min(8, {
        message: "Su contraseña debe tener más de 8 caracteres.",
    }),
    rol: z.enum(["admin", "colaborador"]),
    banco: z.string().min(1, {
        message: "Debe ingresar un banco"
    }),
    cuentaBancaria: z.string().min(1, {
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
    if (!data.noPerro && (!data.perros || data.perros.length === 0)) {
        ctx.addIssue({ code: "custom", path: ["perros"], message: "Seleccione algún perro o marque la casilla \"No tiene\"" });
    }
    // Si está seleccionado que no tiene perros y hay perros seleccionados igual
    if (data.noPerro && data.perros && data.perros.length >= 1) {
        ctx.addIssue({ code: "custom", path: ["perros"], message: "Si no tiene perros debes deseleccionarlos." })
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
    const [showPassword, setShowPassword] = useState(false);
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        async function fetchPerrosOptions(): Promise<void> {
            const controller = new AbortController();
            const timeout = setTimeout(() => { controller.abort(); }, 10000);
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
    }, [context, router, reload]);

    const onSubmit = async (values: FormValues) => {
        form.clearErrors();

        // opcional: timeout/abort como en el fetch de perros
        const controller = new AbortController();
        const timeout = setTimeout(() => { controller.abort(); }, 10000);

        try {
            const token = context?.tokenJwt ?? undefined;
            const url = `/api/users`;

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
     const handlePerroCreated = (p: { id: string; nombre: string }) => {
        setListaPerros(prev => {
        if (prev.some(o => o.value === p.id)) return prev;
        return [...prev, { value: p.id, label: p.nombre }];
        });

        const current = form.getValues("perros") ?? [];
        if (!current.includes(p.id)) {
        form.setValue("perros", [...current, p.id], { shouldDirty: true, shouldValidate: true });
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
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Nombre y apellido*</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">
                                Contraseña*
                            </FormLabel>

                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowPassword((s) => !s);
                                        }}
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        aria-pressed={showPassword}
                                        className="absolute inset-y-0 right-2 flex items-center px-2 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 012.489-6.53M3 3l18 18" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88A3 3 0 0114.12 14.12" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </FormControl>

                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rol"
                    render={({ field }) => (
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
                                            <RadioGroupItem value="admin" />
                                        </FormControl>
                                        <FormLabel>
                                            Administrador
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center gap-3">
                                        <FormControl>
                                            <RadioGroupItem value="colaborador" />
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
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Banco*</FormLabel>
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
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Número de cuenta*</FormLabel>
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
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Cédula de identidad*</FormLabel>
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
                            <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Celular*</FormLabel>
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
                                const noTiene = form.watch("noPerro")
                                return (
                                    <FormItem>
                                    <FormLabel className="font-sans font-medium text-sm leading-5">
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
                                        onCreate={() => { setOpen(true); }}
                                        className="min-w-[240px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )
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
                                            field.onChange(v)
                                            if (v) {
                                            form.setValue("perros", [], { shouldValidate: true, shouldDirty: true })
                                            }
                                        }}
                                        />
                                    </FormControl>
                                    <span className="m-0 whitespace-nowrap text-sm">No tiene</span>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>
                <Button className="w-3/6 primary gap-1 pt-2 pr-3 pb-2 pl-3 gap-1 rounded-md" type="submit">Crear persona</Button>
            </form>
            <RegistrarPerro reload={reload} setReload={setReload} open={open} setOpen={setOpen} onCreated={handlePerroCreated} ownerRequired={false} ownerDisabled={true}/>
        </Form>
    );
}