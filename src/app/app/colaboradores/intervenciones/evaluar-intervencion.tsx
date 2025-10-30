"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Resolver } from "react-hook-form";
import { useFieldArray, useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X, AlertCircleIcon } from "lucide-react";
import { useEffect, useState, useContext, useRef } from "react";
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";
import type { JwtPayload } from "jsonwebtoken";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ExpenseForm } from "@/app/components/expenses/list/edit-cost";

type Pathology = {
  id: string;
  nombre: string;
};

type Dog = {
  id: string;
  nombre: string;
};

interface Intervention {
  id: string;
  timeStamp: string;
  costo: string;
  status: string;
  pairsQuantity: number;
  tipo: string;
  post_evaluacion: string;
  fotosUrls: string[];
  driveLink: string | null;
  description: string | null;
  userId: string | null;
  institutionName?: string;
}
interface EditInterv {
  patients: {
    name: string;
    age: string;
    pathology_id: string;
    experience:  'buena' | 'mala' | 'regular' | null;
  }[];
  dogs: {
    id: string;
    name: string;
    experience: 'buena' | 'mala' | 'regular' | null;
  }[];
  pictures: string[];
  driveLink: string | null;
  expenses: {
    id: string;
    userId: string;
    amount: string;
    type: string;
    userName?: string;
  }[];
}


type ExperienceDog = "good" | "regular" | "bad";
type ExperiencePat = "good" | "regular" | "bad" | undefined;

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export default function EvaluarIntervencion() {
  const [pathologys, setPathologys] = useState<Pathology[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  //const [patientsCards, setPatientCard] = useState([0]);
  const [interv, setInterv] = useState<Intervention>();
  const context = useContext(LoginContext);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const formRefs = useRef<(HTMLFormElement | null)[]>([]);
  const [, setExpenses] = useState<z.infer<typeof expensesSchema>[]>([]);
  const expenseSubmittedRef = useRef<boolean[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [intEd, setIntervEdit] = useState<EditInterv>()

  //para las imagenes y las preview
  const [existingPictures, setExistingPictures] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  if (!id) {
    throw new Error("Falta el parámetro id en la URL");
  }

  const token = context?.tokenJwt;

  let userType: string | null = null;

  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = JSON.parse(atob(payloadBase64)) as JwtPayload;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      userType = payloadJson.type;
    } catch {
      reportError("Error al decodificar el token:");
    }
  }
  
  const isAdmin = userType === "Administrador";

  useEffect(() => {
    const callApi = async () => {
      try {
        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await fetch(`/api/intervention/${id}/pathologies`, {
          headers: baseHeaders,
        });
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
              const retryResp = await fetch(
                `/api/intervention/${id}/pathologies`,
                {
                  method: "GET",
                  headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${newToken}`,
                  },
                }
              );
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

              const body2 = (await retryResp.json()) as Pathology[];
              setPathologys(body2);

              return;
            }
          }
        }
        const datos = (await response.json()) as Pathology[];
        const pathologysData = datos ?? [];
        setPathologys(pathologysData);
      } catch (err) {
        reportError(err);
      }
    };
    callApi().catch((err) => {
      reportError(err);
    });
  }, [context, id, token]);

  useEffect(() => {
    const callApi = async () => {
      try {
        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await fetch(`/api/intervention/${id}/dogs`, {
          headers: baseHeaders,
        });
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
              const retryResp = await fetch(`/api/intervention/${id}/dogs`, {
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

              const body2 = (await retryResp.json()) as Dog[];
              setDogs(body2);

              return;
            }
          }
        }
        const datos = (await response.json()) as Dog[];
        const pathologysData = datos ?? [];
        setDogs(pathologysData);
      } catch (err) {
        reportError(err);
      }
    };
    callApi().catch((err) => {
      reportError(err);
    });
  }, [context, id, token]);

  useEffect(() => {
    const callApi = async () => {
      try {
        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await fetch(`/api/intervention/${id}`, {
          headers: baseHeaders,
        });
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
              const retryResp = await fetch(`/api/intervention/${id}`, {
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

              const body2 = (await retryResp.json()) as Intervention;
              setInterv(body2);

              return;
            }
          }
        }
        const datos = (await response.json()) as Intervention;
        const intervData = datos ?? [];
        setInterv(intervData);
      } catch (err) {
        reportError(err);
      }
    };
    callApi().catch((err) => {
      reportError(err);
    });
  }, [context, id, token]);

  useEffect(() => {
    const callApi = async () => {
      try {
        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await fetch(`/api/intervention/${id}/evaluate`, {
          headers: baseHeaders,
        });
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
              const retryResp = await fetch(
                `/api/intervention/${id}/evaluate`,
                {
                  method: "GET",
                  headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${newToken}`,
                  },
                }
              );
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

              const body2 = (await retryResp.json());
              console.log(body2)
              setIntervEdit(body2);
              return;
            }
          }
        }
        const datos = (await response.json());
        console.log(datos);
        setIntervEdit(datos);
      } catch (err) {
        reportError(err);
      }
    };
    callApi().catch((err) => {
      reportError(err);
    });
  }, [context, id, token]);


  const patientsSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    age: z
      .string()
      .refine((val) => /^\d+$/.test(val), {
        message: "Solo se permiten números enteros",
      })
      .transform((val) => Number(val))
      .refine((val) => val >= 0 && val <= 200, {
        message: "Edad inválida",
      }),
    pathology:
      interv?.tipo === "recreativa"
        ? z.string().optional()
        : z.string().min(1, "Patología requerida"),

    feeling: z.enum(["good", "regular", "bad"]).optional(),
  });

  const dogsExpSchema = z.object({
    dogId: z.string(),
    feelingDog: z.enum(["good", "regular", "bad"]),
  });

  const MAX_FILE_SIZE = 15 * 1024 * 1024;

  const photosSchema = z
    .any()
    .refine(
      (files) => files instanceof FileList && files.length <= 2,
      "Máximo 2 fotos"
    )
    .refine(
      (files) =>
        files instanceof FileList &&
        Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
      "Cada foto debe pesar menos de 15MB"
    );

  const expensesSchema = z.object({
    interventionID: z.string(),
    peopleCI: z.string(),
    type:z.string(),
    measurementType:z.string(),
    amount:z.number().positive({ message: "Debe ingresar una cantidad de KM válida." }),
  });

  const FormSchema = z.object({
    patients: z.array(patientsSchema).min(1),
    dogs: z.array(dogsExpSchema),
    photos: photosSchema.optional(),
    driveLink: z.string().optional(),
    expenses: z.array(expensesSchema).optional()
  });

  type FormValues = z.infer<typeof FormSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      tipo: interv?.tipo,
      patients: [{ name: "", age: "", pathology: "", feeling: "good" }],
      photos: undefined,
      driveLink: "",
      expenses: [{ interventionID: id ?? "", peopleCI: "", type: "", measurementType: "", amount: 1 }],
    } as unknown as FormValues,
  });
  
  const { control } = form
  const { fields: patientFields, append: appendPatient, remove: removePatient } = useFieldArray({
    control,
    name: "patients",
  });

  useEffect(() => {
    if (dogs.length > 0) {
      form.reset({
        ...form.getValues(),
        dogs: dogs.map((dog) => ({ dogId: dog.id, feelingDog: "good" })),
      });
    }
  }, [dogs, form]);

  //mapeo los nombres que me mandan del back a ingles
  const mapToFormFeeling = (s: 'buena' | 'mala' | 'regular' | null | undefined): ExperienceDog => {
    if (!s) return "good";
    if (s === "buena") return "good";
    if (s === "mala") return "bad";
    return "regular";
  };

//setear experiencia perros
  useEffect(() => {
    if (!dogs || dogs.length === 0) return;
    const edMap: Record<string, 'buena'|'mala'|'regular'|null> = {};
    (intEd?.dogs ?? []).forEach((d) => {
      if (d?.id) edMap[String(d.id)] = d.experience ?? null;
    });

    const mappedDogs = dogs.map((d) => ({
      dogId: d.id,
      feelingDog: mapToFormFeeling(edMap[String(d.id)]),
    }));
    
    const current = form.getValues("dogs") ?? [];
    if (current.length === 0) {
      form.setValue("dogs", mappedDogs, { shouldValidate: false, shouldDirty: false });
    } else {
      form.setValue("dogs", mappedDogs, { shouldValidate: false, shouldDirty: false });
    }
  }, [dogs, intEd, form])

  useEffect(() => {
    if (!intEd?.patients || intEd.patients.length === 0) return;

    const mappedPatients = intEd.patients.map((p) => ({
      name: p?.name ?? "",
      age: p?.age !== null ? Number(p.age) : "",
      pathology: p?.pathology_id ? String(p.pathology_id) : "",
      feeling: mapToFormFeeling(p?.experience),
    }));

    const current = form.getValues("patients") ?? [];
    if (current.length === 0) {
      form.setValue("patients", mappedPatients, { shouldValidate: false, shouldDirty: false });
    } else {
      form.setValue("patients", mappedPatients, { shouldValidate: false, shouldDirty: false });
    }
  }, [intEd, form]);


  //!provisorio para mostrar las imagenes
  useEffect(() => {
    if (intEd?.pictures && Array.isArray(intEd.pictures)) {
      setExistingPictures(intEd.pictures);
    }
  }, [intEd]);

  const handleFilesChange = (filesList: FileList | null) => {
    if (!filesList) return;
    const filesArray = Array.from(filesList);

    const totalNow = existingPictures.length + newFiles.length;
    const allowed = Math.max(0, 2 - totalNow);
    const toAdd = filesArray.slice(0, allowed);

    if (toAdd.length === 0) {
      toast.error("No podés subir más fotos (máximo 2).");
      return;
    }

    setNewFiles((prev) => {
      const next = [...prev, ...toAdd];
      return next;
    });
  };

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setNewPreviews(urls);

    return () => {
      urls.forEach((u) => { URL.revokeObjectURL(u); });
    };
  }, [newFiles]);

  const removeExistingPicture = (index: number) => {
    setExistingPictures((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const router = useRouter();
  
  const handleExpenseSubmit = (data: z.infer<typeof expensesSchema>, index: number) => {
      setExpenses((prev) => {
        const copy = [...(prev ?? [])];
        copy[index] = data;
        return copy;
      });

      try {
        form.setValue(
          `expenses.${index}`,
          data,
          { shouldValidate: true, shouldDirty: true }
        );
      } catch {
        reportError("Error setValue expenses.");
      }

      expenseSubmittedRef.current[index] = true;
  };
  
  // Disable the button and show "Sending..." while waiting for all expense submissions to complete.
  // Uses polling every 50ms until all expectedCount submissions are confirmed or the timeout is reached.
  // This is because some submissions may take longer than usual.
  const waitForExpenseSubmissions = (expectedCount: number, timeout = 1200) =>
    new Promise<boolean>((resolve) => {
      const start = Date.now();
      const check = () => {
        const submitted = expenseSubmittedRef.current;
        const ok = Array.from({ length: expectedCount }).every((_, i) => !!submitted[i]);
        if (ok) { resolve(true); return; }
        if (Date.now() - start > timeout) { resolve(false); return; }
        setTimeout(check, 50);
      };

      if (expectedCount === 0) { resolve(true); return; }
    check();
  });

  // eslint-disable-next-line @typescript-eslint/consistent-return
  async function onSubmit(data: FormValues) {
    try {
      const mapFeeling = (f: "good" | "bad" | "regular" | undefined) => {
        switch (f) {
          case "good":
            return "buena";
          case "bad":
            return "mala";
          case "regular":
            return "regular";
          default:
            return undefined;
        }
      };

      //Transform data to match DTO
      const patients = data.patients.map((p) => ({
        name: p.name,
        age: String(p.age), //? string
        pathology_id: p.pathology,
        experience: mapFeeling(p.feeling),
      }));

      const experiences = (data.dogs ?? []).map((exp) => ({
        perro_id: exp.dogId,
        experiencia: mapFeeling(exp.feelingDog),
      }));

      const formData = new FormData();
      formData.append("patients", JSON.stringify(patients));
      formData.append("experiences", JSON.stringify(experiences));

      if (data.photos && data.photos instanceof FileList) {
        Array.from(data.photos)
          .slice(0, 2)
          .forEach((file) => {
            formData.append("photos", file); //Array of File
          });
      }

      formData.append("driveLink", data.driveLink ?? "");

      const res = await fetch(`/api/intervention/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${context?.tokenJwt}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        const resp2 = await fetch(new URL("/api/auth/refresh", BASE_API_URL), {
          method: "POST",
        });
        if (resp2.ok) {
          return onSubmit(data);
        }
        return;
      }
      if (!res.ok) {
        throw new Error("Error en el registro");
      }
      const expensesToSend = (data.expenses ?? []).filter(
        (e) => e && typeof e.amount === "number" && e.amount > 0
      );
      await Promise.all(
        expensesToSend.map((exp) =>
          fetch("/api/expenses", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${context?.tokenJwt}`,
            },
            body: JSON.stringify({
              userId: exp.peopleCI || "",
              interventionId: exp.interventionID,
              type: exp.type,
              concept: "",
              state: "Pendiente de pago",
              amount: exp.amount,
            }),
          })
        )
      );

      form.reset();
      router.push("/app/colaboradores/intervenciones/listado?success=1");

    } catch {
      toast.error(`No se pudo guardar la informacion.`, {
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
  }

  const [expenseCards, setExpenseCard] = useState<number[]>(() =>
    (form.getValues("expenses") ?? []).map((_, i) => i)
  );

  useEffect(() => {
  if (!intEd?.expenses) return;

  // mapear como me lo manda el back a como lo necesita la componente que consumo
  const mapped = intEd.expenses.map((e) => ({
    interventionID: id ?? "",           
    peopleCI: e.userId ?? "",
    type: e.type ?? "Traslado",
    amount: e.amount ? Number(e.amount) : 0,
    // me quedo con el id del gasto por si lo necesitamos despues
    _backendId: e.id,
    _userName: e.userName,
  }));

  form.setValue("expenses", mapped as unknown as FormValues["expenses"], {
    shouldValidate: false,
    shouldDirty: false,
  });

  // keys para render
  const keys = (intEd.expenses.map((e) => e.id ?? "")).map((k, i) =>
    k || String(i)
  );
  setExpenseCard(keys.map((k) => (isNaN(Number(k)) ? k : Number(k))));

  formRefs.current = new Array(mapped.length).fill(null);
  expenseSubmittedRef.current = new Array(mapped.length).fill(false);

}, [intEd, id, form]);

  const handleConfirm = async () => {
    try {
      setConfirming(true);

      expenseSubmittedRef.current = [];
      const expected = expenseCards.length;

      formRefs.current.forEach((f) => f?.requestSubmit());

      const synced = await waitForExpenseSubmissions(expected, 1500);
      if (!synced) {
        reportError("No se sincronizaron todos los gastos. Intentá de nuevo o revisá los gastos.");
        return;
      }

      await form.handleSubmit(
        onSubmit,
      )();
    } finally {
      setConfirming(false);
    }
  };

  const addPatCard = () => {
  appendPatient({ name: "", age: "", pathology: "", feeling: "good" });

  const idx = (form.getValues("patients") || []).length;
  form.clearErrors([
    `patients.${idx}.name`,
    `patients.${idx}.age`,
    `patients.${idx}.pathology`,
    `patients.${idx}.feeling`,
  ]);
};

  const removePatientCard = (index: number) => {
  const current = form.getValues("patients") ?? [];
  if (current.length <= 1) return; // como antes, no borrar si queda 0
  removePatient(index);

  form.clearErrors([
    `patients.${index}.name`,
    `patients.${index}.age`,
    `patients.${index}.pathology`,
    `patients.${index}.feeling`,
  ]);
};

  const idCounterRef = useRef<number>((form.getValues("expenses") ?? []).length);

  const addExpenseCard = () => {
    const newId = idCounterRef.current++;
    setExpenseCard((prev) => [...prev, newId]);

    const currentExpense = form.getValues("expenses") ?? [];
    const newExpense = {
      interventionID: id ?? "",
      peopleCI: "",
      type: "Traslado",
      measurementType: "KM",
      amount: 1,
    };

    const updatedExpenses = [...currentExpense, newExpense];
    form.setValue("expenses", updatedExpenses as FormValues["expenses"]);

    expenseSubmittedRef.current.push(false);
    formRefs.current.push(null);

    const newIndex = updatedExpenses.length - 1;
    form.clearErrors([
      `expenses.${newIndex}.interventionID`,
      `expenses.${newIndex}.peopleCI`,
      `expenses.${newIndex}.type`,
      `expenses.${newIndex}.amount`,
    ]);
  };



 const removeExpenseCard = (cardId: number) => {
    if (expenseCards.length <= 1) return;

    const pos = expenseCards.indexOf(cardId);
    if (pos === -1) return;

    setExpenseCard((prev) => prev.filter((i) => i !== cardId));

    const currentExpenses = form.getValues("expenses") ?? [];
    const updatedExpenses = [...currentExpenses];
    updatedExpenses.splice(pos, 1);
    form.setValue("expenses", updatedExpenses);

    setExpenses((prev) => {
      const copy = [...(prev ?? [])];
      copy.splice(pos, 1);
      return copy;
    });

    if (formRefs.current.length > pos) {
      formRefs.current.splice(pos, 1);
    }
    if (expenseSubmittedRef.current.length > pos) {
      expenseSubmittedRef.current.splice(pos, 1);
    }

    form.clearErrors([
      `expenses.${pos}.interventionID`,
      `expenses.${pos}.peopleCI`,
      `expenses.${pos}.type`,
      `expenses.${pos}.amount`,
    ]);
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form
              .handleSubmit(onSubmit)(e)
              .catch((err) => {
                reportError(err);
              });
          }}
          className="space-y-8 !font-inter w-full -ml-[12px] sm:px-4 gap-y-6 gap-x-4"
        >
          <h3 className="text-2xl font-bold tracking-normal leading-[1.4]">
            Pacientes
          </h3>
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
            {patientFields.map((field, index) => (
              <Card
                key={field.id}
                className="relative w-full md:w-[510px] rounded-lg p-6 bg-[#FFFFFF] border-[#BDD7B3] shadow-none"
              >
                { (patientFields.length > 1) && (
                  <Button
                    type="button"
                    variant="link"
                    size="icon"
                    onClick={() => {
                      removePatientCard(index);
                    }}
                    className="absolute top-0 right-0 w-[40px] h-[40px] bg-white"
                  >
                    <X color="#5B9B40" strokeWidth={1} />
                  </Button>
                )}
                <CardContent className="px-0 space-y-8 text-[#2D3648]">
                  <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <FormField
                      control={form.control}
                      name={`patients.${index}.name`}
                      render={({ field: f }) => (
                        <FormItem className="w-full sm:w-[318px] min-h-[68px] flex flex-col font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">
                          <Label
                            htmlFor={`patients.${index}.name`}
                            className="text-sm h-[16px] font-medium leading-[20px]"
                          >
                            Nombre
                          </Label>
                          <FormControl>
                            <Input
                              {...f}
                              id={`patients.${index}.name`}
                              className="h-[48px] border-1 border-[#D4D4D4] bg-[#FFFFFF]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`patients.${index}.age`}
                      render={({ field: f }) => (
                        <FormItem className="w-full sm:w-[120px] min-h-[40px] flex flex-col">
                          <Label
                            htmlFor={`age-${index}`}
                            className="text-sm h-[16px] leading-[20px] font-medium text-[14px] leading-[16px] tracking-[-0.01em]"
                          >
                            Edad
                          </Label>
                          <FormControl>
                            <Input
                              {...f}
                              id={`patient-${index}-age`}
                              type="string"
                              className="h-[48px] border-1 border-[#D4D4D4] bg-white"
                            />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </div>
                  {pathologys.length > 0 && (
                    <FormField
                      control={form.control}
                      name={`patients.${index}.pathology`}
                      render={({ field: f }) => (
                        <FormItem className=" w-full sm:w-[462px] flex flex-col gap-[8px]">
                          <Label
                            htmlFor={`patients.${index}.pathology`}
                            className="text-sm h-[16px] leading-[20px] font-medium text-[14px] leading-[16px] tracking-[-0.01em]"
                          >
                            Patología
                          </Label>

                          <Select
                            onValueChange={(val: string) => {
                              if (val === "__none") {
                                f.onChange(undefined);
                                return;
                              }
                              f.onChange(val);
                            }}
                            value={
                              typeof f.value === "string" ? f.value: ""
                            }
                          >
                            <SelectTrigger
                              className="w-full !h-[40px] rounded-[6px] border-1 border-[#D4D4D4] bg-white"
                              aria-labelledby={`patients.${index}.pathology`}
                            >
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectGroup>
                                {pathologys.map((pat) => (
                                  <SelectItem
                                    key={pat.id}
                                    value={String(pat.id)}
                                  >
                                    {pat.nombre}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="grid gap-2">
                    <FormLabel className="w-full sm:w-[320px] h-[16px] font-medium text-[14px]">
                      ¿Cómo se sintió?
                    </FormLabel>
                    <RadioGroup
                      onValueChange={(val) => {
                        form.setValue(
                          `patients.${index}.feeling`,
                          val as ExperiencePat
                        );
                      }}
                      value={form.watch(`patients.${index}.feeling`)}
                      className="flex flex-wrap gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="good"
                          id={`patient-${index}-good`}
                          className="
                              !bg-white !border-1 !border-[#5B9B40] !rounded-full
                              data-[state=checked]:!border-[#5B9B40]
                              data-[state=checked]:!text-[#5B9B40]
                              data-[state=checked]:[&>span>svg]:!fill-[#5B9B40]
                              data-[state=checked]:[&>span>svg]:!stroke-[#5B9B40]
                          "
                        />
                        <Label
                          htmlFor={`patient-${index}-good`}
                          className="text-sm leading-[16px]"
                        >
                          Bien
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="regular"
                          id={`patient-${index}-regular`}
                          className="
                              !bg-white !border-1 !border-[#5B9B40] !rounded-full
                              data-[state=checked]:!border-[#5B9B40]
                              data-[state=checked]:!text-[#5B9B40]
                              data-[state=checked]:[&>span>svg]:!fill-[#5B9B40]
                              data-[state=checked]:[&>span>svg]:!stroke-[#5B9B40]
                          "
                        />
                        <Label
                          htmlFor={`patient-${index}-regular`}
                          className="text-sm leading-[16px]"
                        >
                          Regular
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value="bad"
                          id={`patient-${index}-bad`}
                          className="
                              !bg-white !border-1 !border-[#5B9B40] !rounded-full
                              data-[state=checked]:!border-[#5B9B40]
                              data-[state=checked]:!text-[#5B9B40]
                              data-[state=checked]:[&>span>svg]:!fill-[#5B9B40]
                              data-[state=checked]:[&>span>svg]:!stroke-[#5B9B40]
                          "
                        />
                        <Label
                          htmlFor={`patient-${index}-bad`}
                          className="text-sm leading-[16px]"
                        >
                          Mal
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex flex-row md:flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={addPatCard}
                className="!w-[44px] !h-[44px] rounded-[10px] !p-[12px] border-1 border-[#BDD7B3] bg-[#FFFFFF] flex items-center justify-center gap-[8px]"
                aria-label="Agregar paciente"
              >
                <Plus color="#5B9B40" className="w-[20px] h-[20px]" />
              </Button>
            </div>
          </div>
          <h3 className="text-2xl font-bold tracking-normal mb-5 font-inter">
            Perros
          </h3>
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
            {dogs.map((dog, index) => (
              <Card
                key={dog.id}
                className=" 
                w-full md:w-[518px]
                h-[92px]
                rounded-lg
                p-6
                bg-white
                border-[#BDD7B3]
                shadow-none
              "
              >
                <CardContent className="px-0 text-[#2D3648]">
                  <FormLabel className="block font-medium text-[14px] pb-2 leading-[16px]">
                    ¿Cómo se sintió {dog.nombre}?
                  </FormLabel>
                  <RadioGroup
                    onValueChange={(val) => {
                      form.setValue(
                        `dogs.${index}.feelingDog`,
                        val as ExperienceDog
                      );
                    }}
                    defaultValue="good"
                    value={form.watch(`dogs.${index}.feelingDog`)}
                    className="w-full sm:w-[296px] flex flex-row gap-4"
                  >
                    <div className="w-full sm:w-[296px] h-[24px] flex items-center gap-2">
                      <RadioGroupItem
                        value="good"
                        id={`good-${dog.id}`}
                        className="
                          !bg-white !border-1 !border-[#5B9B40] !rounded-full
                          data-[state=checked]:!border-[#5B9B40]
                          data-[state=checked]:!text-[#5B9B40]
                          data-[state=checked]:[&>span>svg]:!fill-[#5B9B40]
                          data-[state=checked]:[&>span>svg]:!stroke-[#5B9B40] 
                        "
                      />
                      <Label
                        htmlFor={`good-${dog.id}`}
                        className="text-sm leading-[16px]"
                      >
                        Buena
                      </Label>
                    </div>
                    <div className="w-full sm:w-[296px] h-[24px] flex items-center gap-2">
                      <RadioGroupItem
                        value="regular"
                        id={`regular-${dog.id}`}
                        className="
                        !bg-white !border-1 !border-[#5B9B40] !rounded-full
                        data-[state=checked]:!border-[#5B9B40]
                        data-[state=checked]:!text-[#5B9B40]
                        data-[state=checked]:[&>span>svg]:!fill-[#5B9B40]
                        data-[state=checked]:[&>span>svg]:!stroke-[#5B9B40] 
                      "
                      />
                      <Label
                        htmlFor={`regular-${dog.id}`}
                        className="text-sm leading-[16px]"
                      >
                        Regular
                      </Label>
                    </div>
                    <div className="w-full sm:w-[296px] h-[24px] flex items-center gap-2">
                      <RadioGroupItem
                        value="bad"
                        id={`bad-${dog.id}`}
                        className="
                        !bg-white !border-1 !border-[#5B9B40] !rounded-full
                        data-[state=checked]:!border-[#5B9B40]
                        data-[state=checked]:!text-[#5B9B40]
                        data-[state=checked]:[&>span>svg]:!fill-[#5B9B40]
                        data-[state=checked]:[&>span>svg]:!stroke-[#5B9B40] 
                      "
                      />
                      <Label
                        htmlFor={`bad-${dog.id}`}
                        className="text-sm leading-[16px]"
                      >
                        Mal
                      </Label>
                    </div>
                  </RadioGroup>

                  <input
                    type="hidden"
                    {...form.register(`dogs.${index}.dogId` as const)}
                    value={dog.id}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="gap-5">
            <h3 className="text-2xl font-bold font-inter">Fotos</h3>

            <p className="pt-2 pb-4">
              Solo podés adjuntar dos fotos de máximo 15 MB cada una.
            </p>

            <div>
              <input
                id="picture"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => { handleFilesChange(e.target.files); }}
                className="
                  max-w-[518px] h-[40px] rounded-md border border-[#D4D4D4]
                  file:font-semibold file:text-[#121F0D] file:bg-white 
                  file:border-none file:px-2 file:cursor-pointer
                  text-[#777d74]
                "
              />
            </div>

            {/* Previews imagenes */}
            {(existingPictures.length > 0 || newPreviews.length > 0) && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 gap-4 max-w-[518px]">

                {existingPictures.map((url, i) => (
                  <div
                    key={`existing-${i}`}
                    className="relative border border-[#D4D4D4] rounded-md overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`Foto existente ${i + 1}`}
                      className="object-cover w-full h-[140px]"
                    />
                    <button
                      type="button"
                      onClick={() => { removeExistingPicture(i); }}
                      className="
                        absolute top-1 right-1 bg-white text-[#121F0D] font-bold 
                        rounded-full w-6 h-6 flex items-center justify-center 
                        border border-[#D4D4D4] hover:bg-gray-100
                      "
                    >
                      ×
                    </button>
                  </div>
                ))}

                {newPreviews.map((url, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative border border-[#D4D4D4] rounded-md overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`Foto nueva ${i + 1}`}
                      className="object-cover w-full h-[140px]"
                    />
                    <button
                      type="button"
                      onClick={() => { removeNewFile(i); }}
                      className="
                        absolute top-1 right-1 bg-white text-[#121F0D] font-bold 
                        rounded-full w-6 h-6 flex items-center justify-center 
                        border border-[#D4D4D4] hover:bg-gray-100
                      "
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {form.formState.errors.photos && (
            <p className="mt-2 text-sm text-red-500">
              {form.formState.errors.photos.message as string}
            </p>
          )}
          <div className="py-6">
            <div>
              <p className="w-[379px] h-[28px] font-normal text-[14px] leading-[21px]">
                Si necesitás subir más, podés dejar acá el link a Drive:
              </p>
            </div>
            <FormControl>
              <Input
                type="text"
                placeholder="Ejemplo: https://drive.google.com/drive/folders/1BP_DxHxEql-iViwo"
                {...form.register("driveLink")}
                className="max-w-[518px] h-[40px] rounded-md mt-2 border-1 border-[#D4D4D4]"
              />
            </FormControl>
          </div>
        </form>
      </Form>
      <h3 className="text-2xl font-bold tracking-normal leading-[1.4]">
        Costos
      </h3>
      <div className="py-6">
        <Alert variant= "destructive" className="max-w-[588px] border-[#DC2626]">
          <AlertCircleIcon />
          <AlertDescription>
            Solo subí el gasto si lo realizaste para trasladar a un perro.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap py-6">
          {expenseCards.map((cardKey, index) => {
            const initialData = (form.getValues("expenses") ?? [])[index] ?? undefined;
            return (
              <Card
                key={cardKey}
                className={cn(
                  "relative w-full md:w-[510px] rounded-lg p-6 bg-[#FFFFFF] border-[#BDD7B3] shadow-none",
                  (isAdmin || false) && "pointer-events-none opacity-50"
                )}
              >
                {expenseCards.length > 1 && (
                  <Button
                    type="button"
                    variant="link"
                    size="icon"
                    onClick={() => {
                      removeExpenseCard(cardKey);
                    }}
                    className="absolute top-0 right-0 w-[40px] h-[40px] bg-white"
                  >
                    <X color="#5B9B40" strokeWidth={1} />
                  </Button>
                )}
                <CardContent className="px-0 space-y-8 text-[#2D3648]">
                  {interv?.id && (
                    <ExpenseForm
                      ref={(el) => {
                        formRefs.current[index] = el;
                      }}
                      InterventionID={interv.id}
                      initialData={initialData ?? undefined}
                      hideIntervention={true}
                      onSubmit={(data) => {
                        handleExpenseSubmit(data, index);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}

          <div className="flex flex-row md:flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={addExpenseCard}
              className={cn(
                "!w-[44px] !h-[44px] rounded-[10px] !p-[12px] border-1 border-[#BDD7B3] bg-[#FFFFFF] flex items-center justify-center gap-[8px]",
                (isAdmin || false) && "pointer-events-none opacity-50"
              )}
            >
              <Plus color="#5B9B40" className="w-[20px] h-[20px]" />
            </Button>
          </div>
        </div>
      </div>
      <Button
        type="button"
        onClick={() => { handleConfirm().catch(reportError); }}
        disabled={confirming}
        className="min-w-[80px] h-[40px] mb-10 rounded-[6px] px-[20px] py-4 bg-[#5B9B40] text-white gap-[8px] flex items-center justify-center"
      >
        <span className="font-bold font-sans text-[16px] leading-[24px] tracking-[-0.01em]">
          {confirming ? "Guardando..." : "Guardar cambios"}
        </span>
      </Button>
    </div>
  );
}
