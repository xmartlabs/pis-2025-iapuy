import type { Control } from "react-hook-form";
import { Plus,Minus } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Button } from "@/components/ui/button";
const uruguayPhoneRegex = /^(09\d{7}|[2-7]\d{7})$/;
export const contactsSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  contact: z.union([
    z.string().min(1, "Una forma de contacto es obligatoria").email("Debe ser un correo o telefono o celular"),
    z.string().min(1, "Una forma de contacto es obligatoria").regex(uruguayPhoneRegex, "Debe ser un correo o telefono o celular"),
  ]),
});

export const mainSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  Pathologies: z.array(z.string()),
});

export const FormSchema = z.object({
  main: mainSchema,
  contacts: z.array(contactsSchema).optional(),
});
type FormValues = z.infer<typeof FormSchema>;

interface ContactFieldsProps {
  control: Control<FormValues>;
  index: number;
  appendContact: (value: { name: string; contact: string }) => void;
  removeContact: (index: number) => void;
  renderAppend:boolean;
  renderRemove:boolean;
}

export default function ContactFields({ control, index,appendContact,removeContact,renderAppend,renderRemove}: ContactFieldsProps) {


  return (
    <div className="max-w-[542px] max-h-[328px] rotate-0 opacity-100 flex gap-5">
        <div className="w-[482px] h-[328px] rotate-0 opacity-100 flex flex-col gap-8 
            rounded-lg border border-[#BDD7B3] bg-white 
            pt-10 pr-10 pb-14 pl-10">
            <h1 className="w-auto h-[32px] font-serif font-semibold text-2xl leading-8 tracking-[-0.015em]">
                Referente {index + 1}
            </h1>
            <FormField
                control={control}
                name={`contacts.${index}.name`} // ruta dinámica
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="font-sans font-medium text-sm leading-5 tracking-normal">Nombre</FormLabel>
                    <FormControl>
                    <Input
                        className="max-w-[402px] h-[40px] rotate-0 opacity-100 rounded-md border border-[#D4D4D4] bg-white px-3 py-2.5" 
                        {...field} 
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`contacts.${index}.contact`} // ruta dinámica
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="font-sans font-medium text-sm leading-5 tracking-normal">Contacto</FormLabel>
                    <FormControl>
                    <Input 
                        className="max-w-[402px] h-[40px] rotate-0 opacity-100 rounded-md border border-[#D4D4D4] bg-white px-3 py-2.5"
                        {...field} 
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <div className="flex flex-col gap-2 min-w-[40px]">
          {renderAppend && (
            <Button
                type="button"
                onClick={() => { appendContact({ name: "", contact: "" }); }}
                className="w-10 h-10 p-3 !bg-white border border-[#BDD7B3] rounded-md flex items-center justify-center"
            >
                <Plus className="w-4 h-4" stroke="#5B9B40" />
            </Button>
          )}
            {renderRemove &&(
            <Button
                type="button"
                variant="destructive"
                onClick={() => {removeContact(index);}}
                className="w-10 h-10 p-3 bg-white rounded-md bg-red-600 flex items-center"
            >
                <Minus />
            </Button>)}
        </div>
        
    </div>
  );
}
