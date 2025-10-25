"use client";

import React, { useContext} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";

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

      const res = await fetch("/api/fixed-costs", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${context?.tokenJwt}`,
        },
        body: JSON.stringify({banios: d.banios,
            desparasitacionesExterna: d.desparasitacionesExterna, 
            desparasitacionesInterna: d.desparasitacionesInterna, 
            vacunas: d.vacunas, 
            kilometros: d.kilometros, 
            honorario: d.honorario}),
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
          <DialogHeader className="!w-full  !items-center !m-0 shrink-0">
            <DialogTitle className="!font-semibold !text-lg !leading-[100%] !tracking-[-0.025em] !text-left !w-full">
              Configuración de montos fijos
            </DialogTitle>
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
                        <CardContent className="grid gap-6 !pb-6 !px-0">
                          <FormField
                            control={form.control}
                            name="banios"
                            render={({ field }) => (
                              <FormItem className="grid gap-2">
                                <FormLabel htmlFor="banios">
                                  Baños a perros
                                </FormLabel>
                                <FormControl>
                                  <Input id="banios" {...field} />
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
                                  Desparacitación Externa
                                </FormLabel>
                                <FormControl>
                                  <Input id="desparasitacionesExterna" {...field} />
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
                                  Desparacitación Interna
                                </FormLabel>
                                <FormControl>
                                  <Input id="desparasitacionesInterna" {...field} />
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
                                <FormLabel htmlFor="vacunas">
                                  Vacunacion
                                </FormLabel>
                                <FormControl>
                                  <Input id="vacunas" {...field} />
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
                                <FormLabel htmlFor="kilometros">
                                  Monto por km
                                </FormLabel>
                                <FormControl>
                                  <Input id="kilometros" {...field} />
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
                                  <Input id="honorario" {...field} />
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
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
