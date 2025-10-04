"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MultiSelect } from "@/components/ui/multiselect";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const formSchema = z
  .object({
    date: z
      .string()
      .min(1, { message: "Debe seleccionar una fecha" })
      .refine(
        (dateString) => {
          const selectedDate = new Date(dateString);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          return selectedDate >= today;
        },
        {
          message: "La fecha debe ser hoy o en el futuro",
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
    type: z.enum(["admin", "colaborador"]),
    institution: z.string().min(1, {
      message: "Debe ingresar una institución",
    }),
    description: z.string().min(1, {
      message: "Debe ingresar una descripción",
    }),
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

const institutionSchema = z.object({
  id: z.string(),
  nombre: z.string(),
});
const institutionArraySchema = z.array(institutionSchema);
const institutionEnvelopeSchema = z.object({ data: institutionArraySchema });
const refreshSchema = z.object({ accessToken: z.string() });

type Institiution = z.infer<typeof institutionSchema>;
type InstitutionOption = { value: string; label: string };

type FormValues = z.infer<typeof formSchema>;

function errorToString(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export default function NuevaInstervencion() {
  const router = useRouter();
  const context = useContext(LoginContext);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      hour: "",
      pairQuantity: 1,
      type: "admin",
      institution: "",
      description: "",
    },
  });
  // obtener todas las instituciones

  return <h1>Pantalla de NuevaIntervencion</h1>;
}
