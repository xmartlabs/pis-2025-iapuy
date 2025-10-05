"use client"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage  } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Resolver } from "react-hook-form";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Upload } from 'lucide-react';
import { useEffect, useState, useContext } from "react";
import { useParams } from "next/navigation";
import { LoginContext } from "@/app/context/login-context";
import { Minus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


//!const searchParams = useSearchParams();

type Pathology = {
  id: string;
  nombre: string
}

type Dog = {
  id: string;
  nombre: string;
}

type ExperienceDog = "good" | "regular" | "bad";
type ExperiencePat = "good" | "regular" | "bad" | undefined;



const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");



export default function EvaluarIntervencion(){
  const [pathologys, setPathologys] = useState<Pathology[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [patientsCards, setPatientCard] = useState([0]);
  const context = useContext(LoginContext);
  const { interventionId } = useParams<{ interventionId?: string }>();
  //! Hardcoded id for testing (cambiar por id de tu base de datos)
  const id = interventionId ?? "8426ad74-8ca1-413f-acc2-5b43b0445280";

  useEffect(()=> {
    const callApi = async () => {
      try{
        const token = context?.tokenJwt;
        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await fetch(`/api/intervencion/${id}/pathologies`, { headers: baseHeaders });
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
              const retryResp = await fetch(`/api/intervencion/${id}/pathologies`, {
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

              const body2 = await retryResp.json() as Pathology[];
              setPathologys(body2);

              return
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
  }, []);

  useEffect(()=> {
    const callApi = async () => {
      try{
        const token = context?.tokenJwt;
        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await fetch(`/api/intervencion/${id}/dogs`, { headers: baseHeaders });
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
              const retryResp = await fetch(`/api/intervencion/${id}/dogs`, {
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

              const body2 = await retryResp.json() as Dog[];
              setDogs(body2);

              return
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
  }, []);

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
    pathology: z.string().optional(),
    feeling: z.enum(["good", "regular", "bad"]).optional(),
  });
  
  const dogsExpSchema = z.object({
    dogId: z.string(),
    feelingDog: z.enum(["good", "regular", "bad"])
  })

  const MAX_FILE_SIZE = 20 * 1024 * 1024;

  const photosSchema = z 
    .any()
    .refine(
      (files) => files instanceof FileList && files.length <= 2,
      "Máximo 2 fotos"
    ).refine(
      (files) =>
        files instanceof FileList &&
        Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
      "Cada foto debe pesar menos de 15MB"
    );


  const FormSchema = z.object({
    patients: z.array(patientsSchema).min(1),
    dogs: z.array(dogsExpSchema),
    photos: photosSchema.optional(),
    driveLink: z.string().optional(),

  });

  type FormValues = z.infer<typeof FormSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      patients: [{ name: "", age: "", pathology: "", feeling: "good" }],

      photos: undefined,
      driveLink: "",
    } as unknown as FormValues,
  });

  const { control } = form;
  useFieldArray({
    control,
    name: "patients",
  });
    
  useEffect(() => {
    if (dogs.length > 0) {
      form.reset({
        ...form.getValues(),
        dogs: dogs.map(dog => ({ dogId: dog.id, feelingDog: "good" })),
       });
    }
  }, [dogs]);


  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/consistent-return
  async function onSubmit(data: FormValues ) {
    try {
      const mapFeeling = (f: "good" | "bad" | "regular"| undefined) => {
        switch (f) {
          case "good": return "buena";
          case "bad": return "mala";
          case "regular": return "regular";
          default:
            return undefined;
        }
      };

      //transform data to match DTO
      const patients = data.patients.map((p) => ({
        name: p.name,
        age: String(p.age), //? string
        pathology_id: p.pathology,
        experience:  mapFeeling(p.feeling),
      }));

      const experiences = (data.dogs ?? []).map((exp) => ({
        perro_id: exp.dogId,
        experiencia: mapFeeling(exp.feelingDog),
      }));

      const formData = new FormData();

      formData.append("patients", JSON.stringify(patients));
      formData.append("experiences", JSON.stringify(experiences));

      if(data.photos && data.photos instanceof FileList){
        Array.from(data.photos).slice(0,2).forEach((file) => {
          formData.append("photos",file); //array de File
        });
      }

      formData.append("driveLink", data.driveLink ?? "");

      const res = await fetch(`/api/intervencion/${id}`,{
        method: "PUT",
        headers: {
          Authorization: `Bearer ${context?.tokenJwt}`
        },
        body: formData
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
      if (res.ok) {
        form.reset();
        router.push("/app/colaboradores/intervenciones/listado?success=1");
      } else {
        throw new Error("Error en el registro");
      }
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

  const addPatCard = () => {
    const newIndex = patientsCards.length;

    setPatientCard((prev) => [...prev, newIndex]);

    const currentPatients = form.getValues("patients") ?? [];
    const newPatient = {
      name: "",
      age: "",
      pathology: "",
      feeling: "good",
    };
    const updatedPatients = [...currentPatients, newPatient];
    form.setValue("patients", updatedPatients as FormValues["patients"]);


    form.clearErrors([
      `patients.${newIndex}.name`,
      `patients.${newIndex}.age`,
      `patients.${newIndex}.pathology`,
      `patients.${newIndex}.feeling`,
    ]);
  };


  const removePatientCard = (index: number) => {
      if (patientsCards.length > 1) {
        const updatedCards = [...patientsCards];
        updatedCards.splice(index, 1);
        setPatientCard(updatedCards);

        const currentPatients = form.getValues("patients") ?? [];
        const updatedPatients = [...currentPatients];
        updatedPatients.splice(index, 1);
        form.setValue("patients", updatedPatients);

        form.clearErrors([
          `patients.${index}.name`,
          `patients.${index}.age`,
          `patients.${index}.pathology`,
          `patients.${index}.feeling`,
        ]);
      }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(onSubmit)(e).catch((err) => { reportError(err); }) }} className="space-y-8 !font-inter w-full -ml-[12px] sm:px-4">
        <h3 className="text-2xl font-bold tracking-normal leading-[1.4]" >
        Pacientes
        </h3>
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
          {patientsCards.map((_, index) => (
            <Card key = {index} className="
              w-full              
              md:w-[510px]    
              rounded-[20px]
              p-6
              bg-[#F7F9FC]
              border-0
              shadow-none
            "
            >
                <CardContent className="px-0 space-y-8 text-[#2D3648]">
                  <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <FormField
                      control={form.control}
                      name={`patients.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="w-full sm:w-[327px] min-h-[72px] flex flex-col font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">
                          <Label htmlFor={`patients.${index}.name`} className="text-sm h-[16px] leading-[20px]">Nombre</Label>
                          <FormControl>
                            <Input 
                            {...field}
                              id={`patients.${index}.name`} 
                              className="h-[48px] border-2 border-[#CBD2E0] bg-[#FFFFFF]"                 
                            />
                          </FormControl>
                          {form.formState.touchedFields.patients?.[index]?.name && <FormMessage />}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`patients.${index}.age`}
                      render={({ field }) => (
                      <FormItem className="w-full sm:w-[111px] min-h-[72px] flex flex-col">
                        <Label htmlFor={`age-${index}`} className="text-sm h-[16px] leading-[20px] font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">Edad</Label>
                        <FormControl>
                          <Input
                            {...field}
                            id={`patient-${index}-age`}
                            type="string"                           
                            className="h-[48px] border-2 border-[#CBD2E0] bg-[#FFFFFF]"
                          />
                        </FormControl>
                        {form.formState.touchedFields.patients?.[index]?.name && <FormMessage />}
                      </FormItem>
                    )}
                  />
                  </div>
                  {pathologys.length > 0 && (
                    <FormField
                      control={form.control}
                      name={`patients.${index}.pathology`}
                      render={({ field }) => (
                        <FormItem className=" w-full sm:w-[462px] flex flex-col gap-[8px]">
                          <Label
                            htmlFor={`patients.${index}.pathology`}
                            className="text-sm h-[16px] leading-[20px] font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">
                            Patología
                          </Label>

                          <Select
                            onValueChange={(val: string) => {
                              if (val === "__none") {
                                field.onChange(undefined);
                                return;
                              }
                              field.onChange(val);
                            }}
                            value={typeof field.value === "string" ? field.value : ""}
                          >
                            <SelectTrigger
                              className="w-full !h-[48px] rounded-[6px] border-2 border-[#CBD2E0] bg-white"
                              aria-labelledby={`patients.${index}.pathology`}
                            >
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>

                            <SelectContent>
                              <SelectGroup>
                                {pathologys.map((pat) => (
                                    <SelectItem key={pat.id} value={String(pat.id)}>
                                      {pat.nombre}
                                    </SelectItem>
                                  ))
                                }
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          {pathologys.length > 0 && form.formState.isSubmitted && !form.watch(`patients.${index}.pathology`) && (
                            <p className="mt-1 text-sm text-red-500">
                              Debes seleccionar una patología.
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  )}
                <FormLabel className="w-full sm:w-[320px] h-[16px] font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">
                  ¿Cómo se sintió el paciente?
                </FormLabel>
                <RadioGroup 
                  onValueChange={(val)=>
                    { form.setValue(`patients.${index}.feeling`,val as ExperiencePat); }
                  }
                  value = {form.watch(`patients.${index}.feeling`)}
                  className="flex flex-wrap gap-6"

                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="good" id={`patient-${index}-good`} className="w-4 h-4" />
                    <Label htmlFor={`patient-${index}-good`} className="text-sm leading-[16px]">Buena</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="regular" id={`patient-${index}-regular`} className="w-4 h-4" />
                    <Label htmlFor={`patient-${index}-regular`} className="text-sm leading-[16px]">Regular</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="bad" id={`patient-${index}-bad`}  className="w-4 h-4"/>
                    <Label htmlFor={`patient-${index}-bad`} className="text-sm leading-[16px]">Mala</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
          <div className="flex flex-row md:flex-col gap-2">
            <Button 
            type="button"
            variant="secondary" 
            size="icon"  
            onClick = {addPatCard} 
            className="!w-[44px] !h-[44px] rounded-[6px] !p-[12px] border-3 border-[#2D3648] bg-[#FFFFFF] flex items-center justify-center gap-[8px]">
              <Plus className="w-[20px] h-[20px]"/>
            </Button>
            {patientsCards.length > 1 && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => { removePatientCard(patientsCards.length - 1); }}
                className="!w-[44px] !h-[44px] rounded-[6px] !p-[12px] border-3 border-[#2D3648] bg-[#FFFFFF] flex items-center justify-center gap-[8px]"
              >
                <Minus className="w-[20px] h-[20px]" />
              </Button>
            )}
          </div>
        </div>
        <h3 className="text-2xl font-bold tracking-normal leading-[1.4] font-inter" >
          Experiencias
        </h3>
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
          {dogs.map((dog,index)=> (
            <Card key= {dog.id} 
            className=" 
              w-full md:w-[510px]
              h-[119px]
              rounded-[20px]
              p-6
              bg-[#F7F9FC]
              border-0
              shadow-none
            "
            >
              <CardContent className="px-0 space-y-8 text-[#2D3648]">
                <FormLabel className="block font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">
                  ¿Cómo se sintió {dog.nombre}?
                </FormLabel>
                <RadioGroup 
                  onValueChange={(val)=>{
                    form.setValue(`dogs.${index}.feelingDog`,val as ExperienceDog); 
                  }}
                  defaultValue="good"
                  value = {form.watch(`dogs.${index}.feelingDog`)}
                  className="w-full sm:w-[296px] flex flex-row gap-4"
                >
                  <div className="w-full sm:w-[296px] h-[24px] flex items-center gap-2">
                    <RadioGroupItem value="good" id={`good-${dog.id}`} className="w-4 h-4" />
                    <Label htmlFor={`good-${dog.id}`} className="text-sm leading-[16px]">Buena</Label>
                  </div>
                  <div className="w-full sm:w-[296px] h-[24px] flex items-center gap-2">
                    <RadioGroupItem value="regular" id={`regular-${dog.id}`} className="w-4 h-4" />
                    <Label htmlFor={`regular-${dog.id}`} className="text-sm leading-[16px]">Regular</Label>
                  </div>
                  <div className="w-full sm:w-[296px] h-[24px] flex items-center gap-2">
                    <RadioGroupItem value="bad" id={`bad-${dog.id}`} className="w-4 h-4"/>
                    <Label htmlFor={`bad-${dog.id}`} className="text-sm leading-[16px]">Mala</Label>
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
        <h3 className="text-2xl font-bold tracking-normal leading-[1.4] font-inter" >
          Fotos
        </h3>
        <h3 className="text-2xl font-bold tracking-normal leading-[1.4] font-inter">
          Fotos
        </h3>
        {typeof window !== "undefined" && (() => {
          const photos = form.watch("photos") as FileList;
          if (photos instanceof FileList && photos.length > 0) {
            return (
              <ul className="mb-3 relative z-10 flex flex-col gap-2">
                {Array.from(photos).map((file, idx) => (
                  <li
                    key={idx}
                    className="
                      flex items-center justify-between
                      px-3 py-1.5
                      rounded-md
                      w-[332px]
                      shadow-sm
                      text-sm text-[#2D3648]
                      font-medium
                    "
                  >
                    {file.name}
                  </li>
                ))}
              </ul>
            );
          }
          return null;
        })()}
        <div className="relative w-[332px]">
          <label
            htmlFor="picture"
            className="block w-[332px] h-[48px] rounded-[6px] border-2 border-gray-200 bg-[#F7F9FC] cursor-pointer"
          >
            <span className="absolute top-[12px] left-[12px] w-[276px] h-[24px] font-normal text-[#2D3648] text-[16px] leading-[24px] tracking-[-0.01em]">
              Adjuntar
            </span>
            <input
              id="picture"
              type="file"
              multiple
              {...form.register("photos")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-hidden="true"
            />
          </label>
          <div className="absolute top-[12px] left-[296px] w-[24px] h-[24px]">
            <Upload className="w-[24px] h-[24px]" />
          </div>
        </div>
        {form.formState.errors.photos && (
          <p className="mt-2 text-sm text-red-500">
            {form.formState.errors.photos.message as string}
          </p>
        )}

        
        <div className="w-[327px] h-[139px] ">
          <div className="w-[327px] h-[91px] gap-[8px] pb-[4px]">
            <FormLabel className="font-bold text-[16px] leading-[24px]">
              Link a más fotos
            </FormLabel>
            <FormDescription className="w-[327px] h-[63px] font-normal text-[14px] leading-[21px] tracking-[-0.01em]">
              Solo podés adjuntar tres, así que si necesitás <br/> subir más, podés dejar acá el link a Drive con el <br/> resto.
            </FormDescription>
          </div>
          <FormControl>
            <Input
              type="text"
              {...form.register("driveLink")}
              className="w-[327px] h-[40px] rounded-[6px] !p-[12px] border-2 border-[#CBD2E0]"
            />
          </FormControl>
        </div>

        <Button
          className="w-[119px] h-[48px] rounded-[6px] px-[20px] py-[12px] bg-[#2D3648] text-white gap-[8px] flex items-center justify-center"
        >
          <span className="font-bold font-sans text-[16px] leading-[24px] tracking-[-0.01em]">
            Confirmar
          </span>
        </Button>
      </form>
    </Form>
  );
};
