'use client'

import React from "react";
import { HeartPulse } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { z, ZodType, ZodTypeAny } from "zod";
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type DataVacuna = {
    fecha: string;
    marca?: string;
    carnet: File;
};

type DataBanio = {
    fecha: string;
};

type DataDesparasitacion = {
    tipo: "interna" | "externa";
    fecha: string;
    marca?: string;
};


export default function RegistroSanidad() {

    const vacunaSchema = z.object({
        fechaInVac: z.string().min(2, { message: "Debes completar la fecha de vacunación" }),
        marcaInVac: z.string().optional(),
        carnetInVac: z
            .any()
            .refine((file) => file?.length > 0, "Debes adjuntar el carnet de vacuna"),
    });

    const banioSchema = z.object({
        fechaInBanio: z.string().min(2, { message: "Debes completar la fecha del baño" }),
    });

    const desparacitacionSchema = z.object({
        desparasitacionTipo: z.enum(["interna", "externa"]).optional(),
        fechaInDes: z.string().min(2, { message: "Debes completar la fecha de desparacitación." }),
        marcaInDes: z.string().optional(),
    });

    const schemaPorTab = {
        vacuna: vacunaSchema,
        banio: banioSchema,
        desparasitacion: desparacitacionSchema,
    } as const;
    type Tab = keyof typeof schemaPorTab;

    const [tab, setTab] = React.useState<Tab>("vacuna");
    const schemaActual = schemaPorTab[tab] as ZodTypeAny;

    type FormValuesVacuna = z.infer<typeof vacunaSchema>;
    type FormValuesBanio = z.infer<typeof banioSchema>;
    type FormValuesDesparasitacion = z.infer<typeof desparacitacionSchema>;

    type FormValues = FormValuesVacuna & FormValuesBanio & FormValuesDesparasitacion;
    const form = useForm<FormValues>({
        resolver: zodResolver(schemaPorTab[tab] as unknown as ZodType<FormValues, any, any>),
        defaultValues: {
            fechaInVac: "",
            marcaInVac: "",
            carnetInVac: undefined,
            fechaInBanio: "",
            desparasitacionTipo: undefined,
            fechaInDes: "",
            marcaInDes: "",
        },
    });

    async function onSubmit(data: z.infer<typeof vacunaSchema> | z.infer<typeof banioSchema> | z.infer<typeof desparacitacionSchema>) {
        try {
            let dataFormat;

            if (tab === "vacuna") {
                dataFormat = {
                    fecha: data.fechaInVac,
                    marca: data.marcaInVac || undefined,
                    carnet: data.carnetInVac || null,
                };
            } else if (tab === "banio") {
                dataFormat = { fecha: data.fechaInBanio };
            } else {
                dataFormat = {
                    tipo: data.desparasitacionTipo!,
                    fecha: data.fechaInDes,
                    marca: data.marcaInDes || undefined,
                };
            }

            await fetch(`/api/${tab}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataFormat),
            });
            if (res.ok) {
                setOpen(false);
                form.reset();

                toast.success(`¡Datos de ${schemaActual} guardados correctamente!`, {
                    duration: 5000,
                    icon: null,
                    className:
                        "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md w font-sans font-semibold text-sm leading-5 tracking-normal",
                    style: {
                        background: "#FFFFFF",
                        border: "1px solid #BDD7B3",
                        color: "#121F0D",
                    },
                });
            } else {
                toast.error(`No se pudo guardar los datos de ${schemaActual}.`, {
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
            console.error(error);

        }
    }


    return (
        <div className="font-sans">
            <Dialog>
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
                        <div className="!px-6 !-mt-5">
                            <form onSubmit={form.handleSubmit(onsubmit)}>
                                <Tabs defaultValue="regSanidad" className="!rounded-md" value={tab} onValueChange={(newTab) => setTab(newTab)}>
                                    <TabsList className="bg-[#DEEBD9] !rounded-md !p-1 !radius">
                                        <TabsTrigger value="vacuna"
                                            className="
                                            !px-3
                                            data-[state=active]:bg-white data-[state=active]:text-black 
                                            data-[state=inactive]:text-[#5B9B40]
                                            !rounded-md
                                            "
                                        >
                                            Vacuna
                                        </TabsTrigger>
                                        <TabsTrigger value="banio"
                                            className="
                                            !px-3
                                            data-[state=active]:bg-white data-[state=active]:text-black 
                                            data-[state=inactive]:text-[#5B9B40]
                                            !rounded-md
                                            "
                                        >
                                            Baño
                                        </TabsTrigger>
                                        <TabsTrigger value="desparacitacion"
                                            className="
                                            !px-3 
                                            data-[state=active]:bg-white data-[state=active]:text-black 
                                            data-[state=inactive]:text-[#5B9B40]
                                            !rounded-md
                                            "
                                        >
                                            Desparacitación
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="vacuna" className="">
                                        <Card className="!border-none !shadow-none">
                                            <CardContent className="grid gap-6 !pb-6 !pt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="fechaInVac"
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
                                                    name="marcaInVac"
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
                                                    name="carnetInVac"
                                                    render={({ field }) => (
                                                        <FormItem className="grid gap-2 w-full">
                                                            <FormLabel>Carnet de vacuna*</FormLabel>
                                                            <FormControl>
                                                                <Input type="file" className="file:ml-2 file:h-full" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="banio">
                                        <Card className="!border-none !shadow-none">
                                            <CardContent className="grid !pb-6 !pt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="fechaInBanio"
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
                                    <TabsContent value="desparacitacion">
                                        <Card className="!border-none !shadow-none !pb-6 !pt-4">
                                            <CardContent className="grid !gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="desparasitacionTipo"
                                                    render={({ field }) => (
                                                        <FormItem className="flex gap-4">
                                                            <RadioGroup value={field.value} onValueChange={field.onChange} defaultValue="interna" className="flex gap-4">
                                                                <div className="flex items-center gap-2">
                                                                    <RadioGroupItem value="interna" id="r1"
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
                                                                    <RadioGroupItem value="externa" id="r2"
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
                                                    name="marcaInDes"
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
                                        <Button variant="outline"
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