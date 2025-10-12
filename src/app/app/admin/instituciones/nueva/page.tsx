"use client";
import CustomBreadCrumb from "@/app/components/bread-crumb/bread-crumb";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X } from "lucide-react";
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
import React, { useContext } from "react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function Nueva() {
  const [tempValue, setTempValue] = React.useState("");
  const context = useContext(LoginContext);
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      main: {
        name: "",
        Pathologies: [],
      },
      contacts: [{ name: "", contact: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });
  const handleFormSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await fetch("/api/instituciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${context?.tokenJwt}`,
        },
        body: JSON.stringify({
          name: data.main.name,
          pathologies: data.main.Pathologies,
          institutionContacts: (data.contacts ?? []).map((c) => ({
            name: c.name,
            contact: c.contact,
          })),
        }),
      });
      if (res.ok) {
        toast.success("Institucion creada con exito", {
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
        router.push("/app/admin/instituciones/listado");
      } else if (res.status === 409) {
        toast.error(`Ya existe la institucion ${data.main.name}`, {
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
      } else {
        toast.error("Ocurrio un error inesperado", {
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
      // eslint-disable-next-line no-console
      console.error(error);
    }
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
        <form
          onSubmit={(e) => {
            form
              .handleSubmit(handleFormSubmit)(e)
              .catch(() => {});
          }}
        >
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
                  <FormItem className="flex-1">
                    <FormLabel>Patologías</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2 items-center py-1 min-h-[40px]">
                        {field.value?.map((p: string, i: number) => (
                          <div
                            key={i}
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
                                handleRemove(i);
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
                          className="flex-1 min-w-[60px] border border-#D4D4D4 rounded-md p-0 focus:ring-0"
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                );
              }}
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
                  renderAppend={index===fields.length-1}
                  renderRemove={index>0}
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
                <span className="font-sans font-medium text-sm leading-6 tracking-normal text-[#EFF5EC]">
                  Crear institución
                </span>
              </div>
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
