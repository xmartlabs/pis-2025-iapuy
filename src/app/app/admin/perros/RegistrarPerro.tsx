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
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"


type UserPair = {
    ci : string, //! chequear seguridad (es correcto manipular el id o solo manipular el JWT) 
    nombre: string,
}

type UsersResponse = {
    count : number;
    data : UserPair[],
    page : number,
    size : number,
    totalItems :number,
    totalPages:number
};

type dataPerro = {
    nombre : string,
    descripcion?: string,
    fortalezas?: string,
    duenioId: string
}

export default function RegistrarPerro() {
    const [duenos, setDuenos] = useState<UserPair[]>([]);
    // const [error, setError] = useState<String | unknown>("");
    
    useEffect(() => {
        const llamadaApi = async () => {
            try {
                const response = await fetch("/api/users");
                const datos = await response.json() as UsersResponse;
                const duenios = datos.data;
                setDuenos(duenios);
            } catch (err) {
                // setError(err);
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
            
            const dataFormat : dataPerro = {
                nombre : data.nombrePerro,
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
            
            const result = await res.json();
            
            if (res.ok) {
                toast("You submitted the following values", {
                    description: (
                        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                            <code className="text-white">{JSON.stringify(result, null, 2)}</code>
                        </pre>
                    ),
                }) 
            }else{
                toast("Error al crear el perro", {
                description: result.error || "Ocurrió un error inesperado",
                });
            }
        }catch(error){
            toast("Error en el servidor", {
                description: String(error),
            });
        }
    }

       
    return (<Dialog>
        <Form {...form}>

            <DialogTrigger asChild>
                <Button variant="outline">+ Agregar perro</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Perro</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">

                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                        <FormField
                            control={form.control}
                            name="nombrePerro"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre Perro" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dueno"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dueño</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Selecciona un dueño" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Dueños</SelectLabel>
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
                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripcion</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fuertes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fuertes</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Confirmar</Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Form>
    </Dialog >
    )
}