'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"


import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    //SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from 'lucide-react'


type UserPair = {
    ci: string, //! chequear seguridad (es correcto manipular el id o solo manipular el JWT)
    nombre: string,
}

type UsersResponse = {
    count: number;
    data: UserPair[],
    page: number,
    size: number,
    totalItems: number,
    totalPages: number
};

type dataPerro = {
    nombre: string,
    descripcion?: string,
    fortalezas?: string,
    duenioId: string
}


export default function RegistrarPerro() {
    const [duenos, setDuenos] = useState<UserPair[]>([]);
    const [open, setOpen] = useState(false);


    useEffect(() => {
        const llamadaApi = async () => {
            try {
                const response = await fetch("/api/users");
                const datos = await response.json() as UsersResponse;
                const duenios = datos.data;
                setDuenos(duenios);
            } catch (err) {
                console.error("Failed to fetch users: ", err);
            }
        };
        llamadaApi();
    }, []);

    const createPerroSchema = z.object({
        nombrePerro: z.string().min(2, {
            message: "Este campo es obligatorio.",
        }),
        dueno: z.string().min(1, { message: "Selecciona un dueño." }),
        descripcion: z.string().optional(),
        fuertes: z.string().optional(),
    })

    const form = useForm<z.infer<typeof createPerroSchema>>({
        resolver: zodResolver(createPerroSchema),
        defaultValues: {
            nombrePerro: "",
            dueno: "",
            descripcion: "",
            fuertes: "",
        },
    })

    async function onSubmit(data: z.infer<typeof createPerroSchema>) {
        try {

            const dataFormat: dataPerro = {
                nombre: data.nombrePerro,
                descripcion: data.descripcion,
                fortalezas: data.fuertes,
                duenioId: data.dueno
            }

            //! las desc y fortalezas si se dejan vacíos se estan insertando como ''
            //! y no como null, chequear para futuras consultas a la DB al no tener campo NULL

            const res = await fetch("/api/perros", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataFormat),
            });

            if (res.ok) {
                setOpen(false)
                form.reset()

                toast.success(`¡Guau! Agregaste a "${data.nombrePerro}" al equipo.`, {
                    duration: 5000,
                    icon: null,
                    className: "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md w font-sans font-semibold text-sm leading-5 tracking-normal",
                    style: {
                        background: "#FFFFFF",
                        border: "1px solid #BDD7B3",
                        color: "#121F0D"
                    },
                });

            } else {
                toast.message(`NO se pudo agregar a "${data.nombrePerro}" al equipo.`, {
                    duration: 5000,
                    icon: null,
                    className: "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md w font-sans font-semibold text-sm leading-5 tracking-normal",
                    style: {
                        background: "#cfaaaaff",
                        border: "1px solid #ec0909ff",
                        color: "#ec0909ff"
                    },
                });
            }
        } catch (error) {
            console.error(error)
        }
    }


    return (
        <div className="font-sans">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        className="
                            !font-sans !font-medium !text-sm !leading-6 !tracking-normal 
                            !flex !items-center !justify-center !gap-1
                            !px-3 !md:px-4 !lg:px-6 !py-2
                            !bg-[#5B9B40] !text-white !hover:bg-[#4b8034]
                            !rounded-md !h-10
                            !w-auto
                        "
                    >
                        <Plus size={16} />
                        Agregar perro
                    </Button>
                </DialogTrigger>

                <DialogContent
                    className="
                        !w-[90%] !max-w-[720px] !box-border !px-4 !md:px-6
                        !h-auto !md:h-[362px] !max-h-[80vh] !overflow-y-auto !overflow-x-hidden
                        !bg-white !border !border-[#D4D4D4] !rounded-md
                        !top-[50%] md:!top-[228px] !left-1/2 !-translate-x-1/2
                    "
                >
                    <Form {...form}>
                        <DialogHeader className="!w-full !my-4  !items-center">
                            <DialogTitle className="!font-sans !font-semibold !text-lg !text-black !w-full !text-left">
                                Nuevo Perro
                            </DialogTitle>
                        </DialogHeader>

                        <div className="!px-0 !pb-4">
                            <form onSubmit={form.handleSubmit(onSubmit)} className="!flex !flex-col !gap-6">
                                <div className="!grid rid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="!w-full">
                                        <FormField
                                            control={form.control}
                                            name="nombrePerro"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nombre</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            className="!w-full !md:max-w-[320px] !h-10"
                                                            placeholder=""
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="!w-full">
                                        <FormField
                                            control={form.control}
                                            name="dueno"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Dueño</FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="!w-full !md:max-w-[320px] !h-10">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {duenos.map((user) => (
                                                                        <SelectItem key={user.nombre} value={user.ci}>
                                                                            {user.nombre}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="!grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="!w-full">
                                        <FormField
                                            control={form.control}
                                            name="descripcion"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Descripción</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            className="!w-full !md:max-w-[320px] !min-h-[80px] !md:h-[80px]"
                                                            placeholder=""
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="!w-full">
                                        <FormField
                                            control={form.control}
                                            name="fuertes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Fuertes</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            className="!w-full !md:max-w-[320px] !min-h-[80px] !md:h-[80px]"
                                                            placeholder=""
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>


                                <DialogFooter className="!w-full !flex flex-col md:flex-row !items-center md:items-center !justify-between gap-3 mt-2 px-0">
                                    <DialogClose asChild>
                                        <Button onClick={() => { form.reset() }}
                                            variant="outline"
                                            className="
                                                w-full md:w-[96px] md:h-[40px] h-10 text-sm px-3 py-2 rounded-md
                                                border-[#5B9B40] text-[#5B9B40] bg-white
                                                hover:bg-[#edd4d1] hover:text-[#bd2717] hover:border-[#bd2717] transition-colors
                                            "
                                        >
                                            Cancelar
                                        </Button>
                                    </DialogClose>

                                    <Button
                                        type="submit"
                                        className="
                                            w-full md:w-[96px] md:h-[40px] !h-10 
                                            !font-sans !font-medium text-sm !leading-6 
                                            !tracking-normal !px-3 !py-2 !rounded-md !flex 
                                            !items-center !justify-center !gap-1 !bg-[#5B9B40] 
                                            !text-white !hover:bg-[#4b8034]
                                        "
                                    >
                                        Confirmar
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}