"use client";

import React, { useContext} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { DollarSign } from "lucide-react";

import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoginContext } from "@/app/context/login-context";

type Props = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

function InputWithIcon({ field, id }: { field: any; id: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
        <DollarSign className="w-[16.67px] h-[18px] text-muted-foreground" style={{ color: "#D4D4D4" }} />
      </span>
      <Input
        id={id}
        {...field}
        className="pl-9" // gives space for the icon
      />
    </div>
  );
}

export default function FixedExpensesConfigDialog({ open, onOpenChange }: Props) {
  const context = useContext(LoginContext);


  const fixedCostsSchema = z.object({
    banios: z.string(),
    desparasitacionesExterna: z.string(),
    desparasitacionesInterna: z.string(),
    vacunas: z.string(),
    kilometros: z.string(),
    honorario: z.string()
  });

  type FormValues = z.infer<typeof fixedCostsSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(fixedCostsSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      banios: "",
      desparasitacionesExterna: "",
      desparasitacionesInterna: "",
      vacunas: "",
      kilometros: "",
      honorario: "",
    },
  });

  async function submitHandler(
    data: z.infer<typeof fixedCostsSchema>
  ) {
    try {
      const d = data;

      // remove empty string, null, or undefined as to not overwrite previous values with 0
      const body: Record<string, unknown> = {};
      Object.entries(d).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          body[key] = value;
        }
      });

      const res = await fetch("/api/fixed-costs", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${context?.tokenJwt}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onOpenChange(false);
        form.reset();
        toast.success(`¡Configuracion de montos fijos modificada exitosamente!`, {
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
        toast.error(`No se pudo guardar los costos ingresados.`, {
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
      // reportError is used across the project; preserve original behavior if available.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reportError(error);
    }
  }

    return (
    <div className="font-sans">
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogContent className="!w-[422px] max-h-[90vh] !h-auto overflow-visible flex flex-col !pb-0">
            <DialogHeader className="!w-full !items-start !m-0 shrink-0">
            <DialogTitle className="!font-semibold !text-lg !leading-[100%] !tracking-[-0.025em] !text-left !w-full">
                Configuración de montos fijos
            </DialogTitle>
            <p className="text-sm mt-1 text-left">
                Si se modifican estos valores, los cambios se verán reflejados desde el día de mañana en adelante.
            </p>
            </DialogHeader>

            <Form {...form}>
            <div className="flex flex-col h-auto">
                <div className="flex-1 overflow-y-auto max-h-[60vh]">
                <form
                    id="fixedExpensesForm"
                    onSubmit={(e) => {
                    e.preventDefault();
                    form
                        .handleSubmit(submitHandler)(e)
                        .catch((err) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        reportError(err);
                        });
                    }}
                >
                    <Card className="!border-none !shadow-none !pb-6 !pt-4">
                    <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 !pb-6 !px-0">
                        <FormField
                        control={form.control}
                        name="banios"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                            <FormLabel htmlFor="banios">Baños a perros</FormLabel>
                            <FormControl>
                                <InputWithIcon field={field} id="banios" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="vacunas"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                            <FormLabel htmlFor="vacunas">Vacunación</FormLabel>
                            <FormControl>
                                <InputWithIcon field={field} id="vacunas" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="desparasitacionesInterna"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                            <FormLabel htmlFor="desparasitacionesInterna">
                                Desparasitación interna
                            </FormLabel>
                            <FormControl>
                                <InputWithIcon field={field} id="desparasitacionesInterna" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="desparasitacionesExterna"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                            <FormLabel htmlFor="desparasitacionesExterna">
                                Desparasitación externa
                            </FormLabel>
                            <FormControl>
                                <InputWithIcon field={field} id="desparasitacionesExterna" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="honorario"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                            <FormLabel htmlFor="honorario">
                                Honorario por intervención
                            </FormLabel>
                            <FormControl>
                                <InputWithIcon field={field} id="honorario" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="kilometros"
                        render={({ field }) => (
                            <FormItem className="grid gap-2">
                            <FormLabel htmlFor="kilometros">Monto por km</FormLabel>
                            <FormControl>
                                <InputWithIcon field={field} id="kilometros" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </CardContent>
                    </Card>
                </form>
                </div>

                <DialogFooter className="!w-full !flex flex-row !items-center !justify-between gap-3 mt-2 !pb-6">
                <DialogClose asChild>
                    <Button
                    onClick={() => {
                        form.reset();
                    }}
                    variant="outline"
                    className="
                        !w-[95px] h-10 text-sm px-3 rounded-md
                        border-[#5B9B40] text-[#5B9B40] bg-white
                        hover:bg-[#edd4d1] hover:text-[#bd2717] 
                        hover:border-[#bd2717] transition-colors
                    "
                    >
                    Descartar
                    </Button>
                </DialogClose>
                <Button
                    form="fixedExpensesForm"
                    type="submit"
                    className="
                    !w-[141px] h-10 text-sm px-3 rounded-md
                    !font-sans !font-medium text-sm !leading-6 
                    !tracking-normal !px-3 !rounded-md !bg-[#5B9B40] 
                    !text-white hover:bg-[#4b8034] transition-colors
                    "
                >
                    Guardar cambios
                </Button>
                </DialogFooter>
            </div>
            </Form>
        </DialogContent>
        </Dialog>
    </div>
    );
}