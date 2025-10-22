"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MinusIcon, PlusIcon } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { Textarea } from "@/components/ui/textarea";

const today = new Date();
const maxYear = today.getFullYear() + 5;
const formatDate = (date: Date) => date.toISOString().split("T")[0];

const formSchema = z
  .object({
    date: z
      .string()
      .min(1, { message: "Debe seleccionar una fecha" })
      .refine(
        (dateString) => {
          const selectedDate = new Date(dateString);
          if (isNaN(selectedDate.getTime())) return false;

          const selectedYear = selectedDate.getFullYear();

          if (selectedYear > maxYear || selectedYear < 1900) return false;

          const current = new Date();
          current.setHours(0, 0, 0, 0);
          selectedDate.setHours(0, 0, 0, 0);

          return selectedDate >= current;
        },
        {
          message: `La fecha debe ser hoy o en el futuro, y el año no puede superar ${maxYear}`,
        }
      ),
    hour: z
      .string()
      .min(1, { message: "Debe seleccionar una hora" })
      .refine(
        (timeString) => {
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          return timeRegex.test(timeString);
        },
        {
          message: "Formato de hora inválido (HH:MM)",
        }
      ),
    pairQuantity: z.number().min(1, { message: "Debe ingresar una cantidad" }),
    type: z.enum(["Educativa", "Recreativa", "Terapeutica"]),
    institution: z.string().min(1, {
      message: "Debe ingresar una institución",
    }),
    description: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.date && data.hour) {
      const selectedDateTime = new Date(`${data.date}T${data.hour}`);
      const now = new Date();

      if (selectedDateTime <= now) {
        ctx.addIssue({
          code: "custom",
          message: "La fecha y hora debe ser en el futuro",
          path: ["hour"],
        });
      }
    }
  });

type Institution = {
  id: string;
  name: string;
};

export type FormValues = z.infer<typeof formSchema>;

export interface NuevaIntervencionFormRef {
  submitForm: () => Promise<void>;
}

interface NuevaIntervencionFormProps {
  institutions: Array<Institution>;
  onSubmit: (values: FormValues) => Promise<void>;
}

const NuevaIntervencionForm = forwardRef<
  NuevaIntervencionFormRef,
  NuevaIntervencionFormProps
>(({ institutions, onSubmit }, ref) => {
  const interventionTypes = ["Educativa", "Recreativa", "Terapeutica"];
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      hour: "",
      pairQuantity: 1,
      type: "Educativa",
      institution: "",
      description: "",
    },
  });

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      const isValid = await form.trigger();
      if (isValid) {
        const values = form.getValues();
        await onSubmit(values);
      }
    },
  }));
  const descripcion = form.watch("description") || "";
  const charCount = descripcion.length;
  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form
            .handleSubmit(onSubmit)()
            .catch(() => {});
        }}
        className="w-full"
      >
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex-1 max-w-[255px]">
                <FormLabel>Fecha*</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    min={formatDate(today)}
                    max={formatDate(
                      new Date(maxYear, today.getMonth(), today.getDate())
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hour"
            render={({ field }) => (
              <FormItem className="flex-1 max-w-[255px]">
                <FormLabel>Hora*</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pairQuantity"
            render={({ field }) => (
              <FormItem className="flex-1 max-w-[255px]">
                <FormLabel>Cantidad de duplas necesaria*</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border border-[#BDD7B3] disabled:opacity-100"
                      onClick={() => {
                        const newValue = Math.max(1, field.value - 1);
                        field.onChange(newValue);
                      }}
                      disabled={field.value <= 1}
                      aria-label="Disminuir cantidad"
                    >
                      <MinusIcon />
                    </Button>
                    <div className="flex items-center justify-center min-w-[3rem] h-10 px-3 py-2 text-sm border border-input bg-background rounded-md">
                      {field.value}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="border border-[#BDD7B3]"
                      onClick={() => {
                        const newValue = field.value + 1;
                        field.onChange(newValue);
                      }}
                      aria-label="Aumentar cantidad"
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="flex-1 max-w-[542px]">
                <FormLabel>Tipo de Intervención*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {interventionTypes.map((type, index) => (
                        <SelectItem key={index} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="institution"
            render={({ field }) => (
              <FormItem className="flex-1 max-w-[542px]">
                <FormLabel>Institución*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione una institución" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectGroup>
                      {institutions && institutions.length > 0 ? (
                        institutions
                          .filter(
                            (inst) => inst?.name && inst.name.trim() !== ""
                          )
                          .map((inst, index) => (
                            <SelectItem key={index} value={inst.name}>
                              {inst.name}
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="no-institutions" disabled>
                          No hay instituciones disponibles
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col mb-8 max-w-[542px]">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <FormLabel>Descripción</FormLabel>
                  <span>{charCount}/400</span>
                </div>
                <FormControl>
                  <Textarea
                    {...field}
                    className="w-full min-h-[80px]  px-3 py-2 text-sm border border-input bg-background rounded-md"
                    rows={4}
                    maxLength={400}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
});
NuevaIntervencionForm.displayName = "NuevaIntervencionForm";

export default NuevaIntervencionForm;
