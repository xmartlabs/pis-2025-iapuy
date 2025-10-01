"use client";
import CustomBreadCrumb from "@/app/components/bread-crumb/bread-crumb";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { z } from "zod";
import ContactFields, {FormSchema } from "@/app/components/instituciones/contact-filds";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export default function NewDog() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      main: {
        name: "",
        Pathologies: "",
      },
      contacts: [
        { name: "", contact: "" }
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });
  const handleFormSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log("Data enviada:", data);
  };

  return (
    <main className="mr-8 space-y-8 !bg-transparent">
      <CustomBreadCrumb
        link={["/app/admin/instituciones/listado", "Instituciones"]}
        current="Nueva institución"
        className=""
      />

      <div className="max-w-[1116px] flex mt-8">
        <h1 className="font-serif font-semibold text-5xl leading-[100%] tracking-[-0.025em] align-middle">
          Nueva institución
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={(e) => { form .handleSubmit(handleFormSubmit)(e) .catch(() => {}); }} >
          <div className="flex gap-4">
            <FormField
                control={form.control}
                name="main.name"
                render={({ field }) => (
                <FormItem className="flex-1">
                    <FormLabel>Nombre*</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="main.Pathologies"
                render={({ field }) => (
                <FormItem className="flex-1">
                    <FormLabel>Patologías</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                </FormItem>
                )}
            />
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
                {fields.map((field, index) => (
                <div key={field.id}>
                    <ContactFields 
                        control={form.control} 
                        index={index}
                        appendContact={append}
                        removeContact={remove} 
                    />
                </div>
                ))}
            </div>
            <div className="mt-8">
                <Button 
                    type="submit" 
                    className="w-[136px] h-10 min-w-[80px] px-3 py-2 rounded-md bg-[#5B9B40] flex items-center justify-center gap-1 opacity-50"
                >   
                    <div className="w-[112px] h-6 px-1 gap-0 opacity-100">
                        <span className="font-sans font-medium text-sm leading-6 tracking-normal text-[#EFF5EC]">Crear institución</span>
                    </div>                
                </Button>
            </div>
        </form>
      </Form>
    </main>
  );
}
