"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContext, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { LoginContext } from "@/app/context/login-context";
import type { PerroDTO } from "./DTOS/perro.dto";

type UserPair = {
  ci: string; //! chequear seguridad (es correcto manipular el id o solo manipular el JWT)
  nombre: string;
};

type UsersResponse = {
  count: number;
  data: UserPair[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

type dataPerro = {
  nombre: string;
  descripcion?: string;
  fortalezas?: string;
  duenioId?: string;
};

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

interface AgregarPerroProps {
  reload: boolean;
  setReload: (product: boolean) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  onCreated?: (p: { id: string; nombre: string }) => void;
  ownerRequired?: boolean;
  ownerDisabled?: boolean;
}

export const RegistrarPerro: React.FC<AgregarPerroProps> = ({
  // eslint-disable-next-line react/prop-types
  reload,
  // eslint-disable-next-line react/prop-types
  setReload,
  // eslint-disable-next-line react/prop-types
  open,
  // eslint-disable-next-line react/prop-types
  setOpen,
  // eslint-disable-next-line react/prop-types
  onCreated,
  // eslint-disable-next-line react/prop-types
  ownerRequired = true,
  // eslint-disable-next-line react/prop-types
  ownerDisabled = false,
}) => {
  const [duenos, setDuenos] = useState<UserPair[]>([]);
  const context = useContext(LoginContext);

  useEffect(() => {
    const llamadaApi = async () => {
      try {
        const token = context?.tokenJwt;
        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await fetch("/api/users", { headers: baseHeaders });
        if (response.status === 401) {
          const resp2 = await fetch(
            new URL("/api/auth/refresh", BASE_API_URL),
            {
              method: "POST",
              headers: { Accept: "application/json" },
            }
          );

          if (resp2.ok) {
            const refreshBody = (await resp2.json().catch(() => null)) as {
              accessToken?: string;
            } | null;

            const newToken = refreshBody?.accessToken ?? null;
            if (newToken) {
              context?.setToken(newToken);
              const retryResp = await fetch("/api/users", {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
              });

              if (!retryResp.ok) {
                const txt = await retryResp.text().catch(() => "");
                throw new Error(
                  `API ${retryResp.status}: ${retryResp.statusText}${
                    txt ? ` - ${txt}` : ""
                  }`
                );
              }

              const ct2 = retryResp.headers.get("content-type") ?? "";
              if (!ct2.includes("application/json"))
                throw new Error("Expected JSON response");

              const body2 = (await retryResp.json()) as UsersResponse;
              const duenios = body2.data;
              setDuenos(duenios);
              return;
            }
          }
        }
        const datos = (await response.json()) as UsersResponse;
        const duenios = datos.data;
        setDuenos(duenios);
      } catch (err) {
        reportError(err);
      }
    };
    llamadaApi().catch((err) => {
      reportError(err);
    });
  }, [context]);

  const createPerroBase = z.object({
    nombrePerro: z.string().min(2, {
      message: "Este campo es obligatorio.",
    }),
    dueno: z.string().optional(),
    descripcion: z.string().optional(),
    fuertes: z.string().optional(),
  });

  const createPerroSchema = createPerroBase.superRefine((val, ctx) => {
    if (ownerRequired && (!val.dueno || val.dueno.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueno"],
        message: "Selecciona un dueño.",
      });
    }
  });

  const form = useForm<z.infer<typeof createPerroSchema>>({
    resolver: zodResolver(createPerroSchema),
    defaultValues: {
      nombrePerro: "",
      dueno: "",
      descripcion: "",
      fuertes: "",
    },
  });

  // eslint-disable-next-line @typescript-eslint/consistent-return
  async function onSubmit(data: z.infer<typeof createPerroSchema>) {
    try {
      const dataFormat: dataPerro = {
        nombre: data.nombrePerro,
        descripcion: data.descripcion || undefined,
        fortalezas: data.fuertes || undefined,
        ...(data.dueno && data.dueno.trim() !== "" ? { duenioId: data.dueno } : {}),
      };

      //! las desc y fortalezas si se dejan vacíos se estan insertando como ''
      //! y no como null, chequear para futuras consultas a la DB al no tener campo NULL

      const res = await fetch("/api/perros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${context?.tokenJwt}`,
        },
        body: JSON.stringify(dataFormat),
      });

      if (res.status === 401) {
        const resp2 = await fetch(new URL("/api/auth/refresh", BASE_API_URL), {
          method: "POST",
          headers: { Accept: "application/json" },
        });

        if (resp2.ok) {
          return onSubmit(data);
        }
        toast.message(`NO se pudo agregar a "${data.nombrePerro}" al equipo.`, {
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
        return;
      }

      if (res.ok) {
        const created = await res.json().catch(() => null) as PerroDTO;
        if (created?.id && created?.nombre) {
          onCreated?.({ id: created.id, nombre: created.nombre });
        }

        setOpen(false);
        form.reset();

        toast.success(`¡Guau! Agregaste a "${data.nombrePerro}" al equipo.`, {
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

        setReload(!reload);
      } else {
        toast.message(`NO se pudo agregar a "${data.nombrePerro}" al equipo.`, {
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form
                    .handleSubmit(onSubmit)(e)
                    .catch((err) => {
                      reportError(err);
                    });
                }}
                className="!flex !flex-col !gap-6"
              >
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
                          <FormLabel>
                            Dueño
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={ownerDisabled}
                            >
                              <SelectTrigger className="!w-full !md:max-w-[320px] !h-10">
                                <SelectValue placeholder={ownerDisabled ? "No requerido" : undefined} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {duenos?.map((user) => (
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
                              maxLength={255}
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
                    <Button
                      onClick={() => {
                        form.reset();
                      }}
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
  );
};
