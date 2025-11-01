"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { z } from "zod";
import ContactFields, {
  FormSchema,
} from "@/app/components/instituciones/contact-filds";
import { LoginContext } from "@/app/context/login-context";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import React, { useContext, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";
import { useRouter } from "next/navigation";
import CustomBreadCrumb from "../bread-crumb/bread-crumb";

interface EditInstitutionScreenProps {
  readonly institution: {
    id: string;
    nombre: string;
    Patologias: { id: string; nombre: string }[];
    InstitutionContacts: { id: string; name: string; contact: string }[];
  };
}

export default function EditInstitutionScreen({
  institution,
}: Readonly<EditInstitutionScreenProps>) {
  const [tempValue, setTempValue] = React.useState("");
  const context = useContext(LoginContext);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      main: {
        name: institution.nombre,
        Pathologies: institution.Patologias.map((p) => p.nombre),
      },
      contacts:
        institution.InstitutionContacts.length > 0
          ? institution.InstitutionContacts.map((c) => ({
              name: c.name,
              contact: c.contact,
            }))
          : [{ name: "", contact: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  // Reset form when institution changes
  useEffect(() => {
    form.reset({
      main: {
        name: institution.nombre,
        Pathologies: institution.Patologias.map((p) => p.nombre),
      },
      contacts:
        institution.InstitutionContacts.length > 0
          ? institution.InstitutionContacts.map((c) => ({
              name: c.name,
              contact: c.contact,
            }))
          : [{ name: "", contact: "" }],
    });
  }, [institution, form]);

  const handleFormSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!context) {
      toast.error("Contexto de autenticación no disponible", {
        duration: 5000,
      });
      return;
    }

    const url = `/api/instituciones/${institution.id}`;
    const bodyData = {
      name: data.main.name,
      pathologies: data.main.Pathologies,
      institutionContacts: (data.contacts ?? []).map((c) => ({
        name: c.name,
        contact: c.contact,
      })),
    };

    try {
      const res = await fetchWithAuth(context, url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        toast.success("Institución actualizada con éxito", {
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
        router.back();
        return;
      }

      if (res.status === 409) {
        toast.error(`Ya existe la institución ${data.main.name}`, {
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

      if (res.status === 403) {
        toast.error("No tiene permisos para realizar esta acción", {
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

      const txt = await res.text().catch(() => "");
      toast.error(txt || "Ocurrió un error inesperado", {
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.error("Ocurrió un error inesperado", { duration: 5000 });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <CustomBreadCrumb
        link={["/app/admin/instituciones/listado", "Instituciones"]}
        current="Editar institución"
        className=""
      />

      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          onClick={() => {
            router.back();
          }}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-serif font-semibold text-4xl">
          Editar institución
        </h1>
      </div>

      <Form {...form}>
        <form
          onSubmit={(e) => {
            form
              .handleSubmit(handleFormSubmit)(e)
              .catch(() => {});
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="main.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre*</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="main.Pathologies"
              render={({ field }) => {
                const handleKeyDown = (
                  e: React.KeyboardEvent<HTMLInputElement>
                ) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (tempValue.trim() !== "") {
                      field.onChange([
                        ...(field.value || []),
                        tempValue.trim(),
                      ]);
                      setTempValue("");
                    }
                  }
                };
                const handleRemove = (index: number) => {
                  const newValues = [...(field.value || [])];
                  newValues.splice(index, 1);
                  field.onChange(newValues);
                };
                return (
                  <FormItem>
                    <FormLabel>Patologías</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2 items-center py-1 min-h-[40px] border rounded-md px-3">
                        {field.value?.map((p: string) => (
                          <div
                            key={p}
                            className="flex items-center gap-0 !bg-[#5B9B40] border border-gray-300 rounded-full pt-0.5 pr-2.5 pb-0.5 pl-2.5"
                          >
                            <Badge className="px-0 !bg-[#5B9B40]">
                              <span className="h-4 font-sans font-semibold text-xs leading-4 tracking-normal text-white">
                                {p}
                              </span>
                            </Badge>
                            <X
                              className="w-4 h-4 cursor-pointer text-white"
                              onClick={() => {
                                const idx = field.value?.indexOf(p) ?? -1;
                                if (idx !== -1) handleRemove(idx);
                              }}
                            />
                          </div>
                        ))}
                        <Input
                          value={tempValue}
                          onChange={(e) => {
                            setTempValue(e.target.value);
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="Presiona Enter para agregar"
                          className="flex-1 min-w-[150px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          </div>

          <div className="space-y-4">
            <h2 className="font-serif font-semibold text-2xl">Contactos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field, index) => (
                <div key={field.id}>
                  <ContactFields
                    control={form.control}
                    index={index}
                    appendContact={append}
                    removeContact={remove}
                    renderAppend={index === fields.length - 1}
                    renderRemove={index > 0}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                router.back();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#5B9B40] hover:bg-[#4a7d33] text-white"
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
