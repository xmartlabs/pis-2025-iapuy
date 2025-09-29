'use client'

import React, { useContext } from "react";
import { HeartPulse } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z } from "zod";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,

} from "@/components/ui/tabs"

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogFooter

} from "@/components/ui/dialog"
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoginContext } from "@/app/context/login-context";
import { useSearchParams } from "next/navigation";

//! Para que el id del perro venga del URL sacar comentario
//import { useSearchParams } from "next/navigation";


const BASE_API_URL = (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export default function RegistroSanidad() {

    const [tab, setTab] = React.useState<Tab>("vaccine");
    const [open, setOpen] = React.useState(false);
    const context = useContext(LoginContext);

    const vacunaSchema = z.object({
        vaccDateIn: z.string().min(2, { message: "Debes completar la fecha de vacunación" }),
        vaccBrandIn: z.string(),
        vaccCardIn: z.instanceof(File, { message: "Debes adjuntar el carnet de vacuna" })

    });

    const banioSchema = z.object({
        bathDateIn: z.string().min(2, { message: "Debes completar la fecha del baño" }),
    });

    const desparasitacionSchema = z.object({
        dewType: z.enum(["Interna", "Externa"]),
        dewDateIn: z.string().min(2, { message: "Debes completar la fecha de desparasitación." }),
        dewBrandIn: z.string()
    });

    const schemaPorTab = {
        vaccine: vacunaSchema,
        bath: banioSchema,
        deworming: desparasitacionSchema,
    } as const;

    type Tab = keyof typeof schemaPorTab;

    type VaccineFormValues = z.infer<typeof vacunaSchema>;
    type BathFormValues = z.infer<typeof banioSchema>;
    type DewormingFormValues = z.infer<typeof desparasitacionSchema>;

    type FormValues = VaccineFormValues & BathFormValues & DewormingFormValues;

    const form = useForm<FormValues>({
        resolver: zodResolver(schemaPorTab[tab]) as unknown as Resolver<FormValues>,
        defaultValues: {
            vaccDateIn: "",
            vaccBrandIn: "",
            vaccCardIn: undefined,
            bathDateIn: "",
            dewType: "Interna",
            dewDateIn: "",
            dewBrandIn: "",
        },
    });

    //! Si la URL tiene id?=perroID el perroIdURL se cambia por la ID hardcodeada
    const searchParams = useSearchParams();

    // eslint-disable-next-line @typescript-eslint/consistent-return
    async function submitHandler(data: z.infer<typeof vacunaSchema> | z.infer<typeof banioSchema> | z.infer<typeof desparasitacionSchema>) {
        try {

            const formData = new FormData();

            const perroId = searchParams.get("id") ?? "";

            if (tab === "vaccine") {
                const d = data as z.infer<typeof vacunaSchema>;

                formData.append("tipoSanidad", "vacuna");
                formData.append("perroId", perroId);
                formData.append("fecha", d.vaccDateIn);
                formData.append("vac", d.vaccBrandIn ?? "");
                formData.append("medicamento", "");
                formData.append("tipoDesparasitacion", "Externa");

                if (d.vaccCardIn) {
                    formData.append("carneVacunas", d.vaccCardIn);
                }

            } else if (tab === "bath") {

                const d = data as z.infer<typeof banioSchema>;

                formData.append("tipoSanidad", "banio");
                formData.append("perroId", perroId);
                formData.append("fecha", d.bathDateIn);
                formData.append("vac", "");
                formData.append("medicamento", "");
                formData.append("tipoDesparasitacion", "Externa");

            } else {

                const d = data as z.infer<typeof desparasitacionSchema>;
                formData.append("tipoSanidad", "desparasitacion");
                formData.append("perroId", perroId);
                formData.append("fecha", d.dewDateIn);
                formData.append("vac", "");
                formData.append("medicamento", d.dewBrandIn);
                formData.append("tipoDesparasitacion", d.dewType);

            }

            const res = await fetch("/api/registros-sanidad", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${context?.tokenJwt}`
                },
                body: formData
            });

            if (res.status === 401) {
                const resp2 = await fetch(new URL("/api/auth/refresh", BASE_API_URL), {
                    method: "POST",
                });
                if (resp2.ok) {
                    return submitHandler(data);
                }
                return;
            }

            if (res.ok) {
                setOpen(false);
                form.reset();
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
            reportError(error);
        }
    }


    return (
        <div className="font-sans">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="
                            !text-sm !leading-6 !tracking-normal 
                            !flex !items-center !justify-center !gap-1
                            !px-3 !md:px-4 !lg:px-6 !py-2
                            !bg-[#5B9B40] !text-white !hover:bg-[#4b8034]
                            !rounded-md !h-10
                            !w-auto">
                        <HeartPulse size={16} />
                        Registrar Sanidad
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[422px]">
                    <Form {...form}>
                        <DialogHeader className="!w-full !p-6 !items-center !m-0">
                            <DialogTitle className="!font-sans !font-semibold !text-lg !text-black !w-full !text-left">Registrar Sanidad</DialogTitle>
                        </DialogHeader>
                        <div className="!px-6 !pt-0 !pb-4">
                            <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(submitHandler)(e).catch((err) => { reportError(err); }) }}>
                                <Tabs defaultValue="vaccine" className="!rounded-md" value={tab} onValueChange={(newTab) => { setTab(newTab as Tab) }}>
                                    <TabsList className="bg-[#DEEBD9] rounded-md p-1 flex items-center justify-between">
                                        <TabsTrigger value="vaccine"
                                            className="w-full text-center !px-4 !py-2
                                            data-[state=active]:bg-white data-[state=active]:text-black 
                                            data-[state=inactive]:text-[#5B9B40]
                                            !rounded-md"
                                        >
                                            Vacuna
                                        </TabsTrigger>
                                        <TabsTrigger value="bath"
                                            className="w-full text-center !px-4 !py-2
                                            data-[state=active]:bg-white data-[state=active]:text-black 
                                            data-[state=inactive]:text-[#5B9B40]
                                            !rounded-md"
                                        >
                                            Baño
                                        </TabsTrigger>
                                        <TabsTrigger value="deworming"
                                            className="w-full text-center !px-4 !py-2
                                            data-[state=active]:bg-white data-[state=active]:text-black 
                                            data-[state=inactive]:text-[#5B9B40]
                                            !rounded-md"
                                        >
                                            Desparasitación
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="vaccine" className="">
                                        <Card className="!border-none !shadow-none">
                                            <CardContent className="!px-0 grid gap-6 !pb-6 !pt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="vaccDateIn"
                                                    render={({ field }) => (
                                                        <FormItem className="grid gap-2">
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
                                                    name="vaccBrandIn"
                                                    render={({ field }) => (
                                                        <FormItem className="grid gap-2">
                                                            <FormLabel>Marca</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="vaccCardIn"
                                                    render={({ field }) => {
                                                        const filename = (field.value as File | null)?.name ?? "Nada cargado todavía";

                                                        return (
                                                            <FormItem>
                                                                <FormLabel>Carnet de vacuna*</FormLabel>
                                                                <FormControl>
                                                                    <div className="flex items-center w-full border border-gray-200 rounded-md overflow-hidden">
                                                                        <label
                                                                            className="flex-shrink-0 px-4 py-2 select-none cursor-pointer text-sm font-medium"
                                                                            aria-hidden={false}
                                                                        >
                                                                            Adjuntar archivo
                                                                            <input
                                                                                type="file"
                                                                                className="sr-only"
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files?.[0] ?? null;
                                                                                    field.onChange(file);
                                                                                }}
                                                                            />
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
                                    <TabsContent value="bath">
                                        <Card className="!border-none !shadow-none">
                                            <CardContent className="!px-0 grid !pb-6 !pt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="bathDateIn"
                                                    render={({ field }) => (
                                                        <FormItem className="grid gap-2">
                                                            <FormLabel>Fecha*</FormLabel>
                                                            <FormControl>
                                                                <Input type="date" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="deworming">
                                        <Card className="!border-none !shadow-none !pb-6 !pt-4">
                                            <CardContent className="!px-0 grid !gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="dewType"
                                                    render={({ field }) => (
                                                        <FormItem className="flex gap-4">
                                                            <RadioGroup value={field.value} onValueChange={field.onChange} defaultValue="interna" className="flex gap-4">
                                                                <div className="flex items-center gap-2">
                                                                    <RadioGroupItem value="Interna" id="r1"
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
                                                                    <RadioGroupItem value="Externa" id="r2"
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
                                                    name="dewDateIn"
                                                    render={({ field }) => (
                                                        <FormItem className="grid gap-2">
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
                                                    name="dewBrandIn"
                                                    render={({ field }) => (
                                                        <FormItem className="grid gap-2">
                                                            <FormLabel>Marca</FormLabel>
                                                            <FormControl>
                                                                <Input {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>

                                <DialogFooter className="!w-full !flex flex-row !items-center !justify-between gap-3 mt-2 !pb-6">
                                    <DialogClose asChild>
                                        <Button onClick={() => { form.reset() }}
                                            variant="outline"
                                            className="
                                                !w-[96px] h-10 text-sm px-3 rounded-md
                                                border-[#5B9B40] text-[#5B9B40] bg-white
                                                hover:bg-[#edd4d1] hover:text-[#bd2717] 
                                                hover:border-[#bd2717] transition-colors
                                            ">
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit"
                                        className="
                                            !w-[96px] h-10 text-sm px-3 rounded-md
                                            !font-sans !font-medium text-sm !leading-6 
                                            !tracking-normal !px-3 !rounded-md !bg-[#5B9B40] 
                                            !text-white hover:bg-[#4b8034] transition-colors
                                        ">
                                        Confirmar
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    </Form>
                </DialogContent>
            </Dialog >
        </div >
    )
}