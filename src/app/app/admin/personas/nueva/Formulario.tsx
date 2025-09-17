"use client";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  pass: z.string().min(8, {
    message: "Su contraseña debe tener más de 8 caracteres.",
  }),
  rol: z.enum(["admin","colaborador"]),
  banco: z.string(),
  cuenta: z.string(),
  ci: z.stringFormat("ci", /^[0-9]{8}$/, {
    message: "La cédula deben ser 8 dígitos sin puntos ni guión."
  }),
  celular: z.stringFormat("cel", /^[0-9]{9}$/),
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

export default function Formulario() {
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        nombre: "",
        pass: "",
        rol: "admin",
        banco: "",
        cuenta: "",
        ci: "",
        celular: "",
        perros: [],
        noPerro: false,
        },
    })
    
    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    name="pass"
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
                        <FormItem>
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
                    name="cuenta"
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
                    render={({field}) => {
                        const noTiene = form.watch("noPerro"); 
                        field.disabled = noTiene;
                        return (
                            <FormItem>
                                <FormLabel className="font-sans font-medium text-sm leading-5 text-foreground">Perro</FormLabel>
                                <FormControl>
                                    <Input {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                <FormField
                    control={form.control}
                    name="noPerro"
                    render={({field}) => (
                        <FormItem className="grid grid-cols-1 md:grid-cols-2">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(v) => {
                                        field.onChange(v);
                                        if(v) {
                                            form.setValue("perros", [], { shouldValidate: true });
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormLabel>No tiene</FormLabel>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Crear persona</Button>
            </form>
        </Form>
    );
}