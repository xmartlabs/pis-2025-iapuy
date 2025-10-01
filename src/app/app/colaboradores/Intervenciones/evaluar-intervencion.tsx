"use client"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel  } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control, FieldValues, Resolver} from "react-hook-form";
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


//const searchParams = useSearchParams();



type Pathology = {
  id: string;
  nombre: string
}

type PathologyResponse = {
  data: Pathology[];
}

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");



export default function EvaluarIntervencion(){
    const [pathologys, setPathologys] = useState<Pathology[]>([]);
    const [patientsCards, setPatientCard] = useState([0]);
    // const [expDogCards, setExpDogCard] = useState([0]);
    const context = useContext(LoginContext);
    const { interventionId } = useParams<{ interventionId?: string }>();
    const id = interventionId ?? "40022a98-73bc-44e8-9ea4-69319ab54c31";


    
    const addPatCard = () =>{
      setPatientCard((prev) => [...prev, prev.length]); 
    }

    // const addExpDogCards = () => {
    //   setExpDogCard((prev) => [...prev, prev.length]);
    // }

    useEffect(()=> {

        const controller = new AbortController();
        const signal = controller.signal;
        let mounted = true;

        const callApi = async () => {
          try{

            const token = context?.tokenJwt;
            
            const response = await fetch(`/api/intervencion/${id}/pathologies`, {
                      method: "GET",
                      headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    });
            console.log(response)

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
                      console.log(retryResp) //!
                    if (!retryResp.ok) {
                      const txt = await retryResp.text().catch(() => "");
                      throw new Error(
                        `API ${retryResp.status}: ${retryResp.statusText}${
                          txt ? ` - ${txt}` : ""
                        }`
                      );
                    }

                    const ct2 = retryResp.headers.get("content-type") ?? "";
                    if (!ct2.includes("application/json")) {
                      console.warn("Intervencion retry: unexpected content-type", ct2);
                      if (mounted && !signal.aborted) setPathologys([]);
                      return;
                    }
                    const vemos = await retryResp.json()
                    console.log(vemos)
                    const body2 = (await retryResp.json()) as PathologyResponse;
                    const pathologysData = Array.isArray(body2?.data) ? body2.data : [];
                    if (mounted && !signal.aborted) setPathologys(pathologysData);
                    return;

                  }
                }
          }
            if (!response.ok) {
            const txt = await response.text().catch(() => "");
            console.error("Intervencion fetch failed:", response.status, txt);
            if (mounted && !signal.aborted) setPathologys([]); // fallback
            return;
          }

      const ct = response.headers.get("content-type") ?? "";
      if (!ct.includes("application/json")) {
        console.warn("Intervencion: unexpected content-type", ct);
        if (mounted && !signal.aborted) setPathologys([]); // fallback
        return;
      }

      const datos = (await response.json().catch(() => null)) as PathologyResponse | null;
      const pathologysData = Array.isArray(datos?.data) ? datos.data : [];
      console.log(datos)
      if (mounted && !signal.aborted) setPathologys(pathologysData);
    } catch (err) {
      if ((err as any)?.name === "AbortError") {
        // request aborted; nada que hacer
        return;
      }
      console.error("callApi error:", err);
      try {
        reportError(err);
      } catch {
        /* ignore */
      }
      if (mounted && !signal.aborted) setPathologys([]); // fallback seguro
    }
  };

    //     const datos = (await response.json()) as PathologyResponse;
    //     const pathologysData = datos.data ?? [];
    //     setPathologys(pathologysData);
    //   } catch (err) {
    //     reportError(err);
    //   }
    // };
    callApi().catch((err) => {
    console.error("callApi top error:", err);
    try {
      reportError(err);
    } catch {
      /* ignore */
    }
    if (!signal.aborted) setPathologys([]);
  });

  return () => {
    mounted = false;
    controller.abort();
  };
}, []);


  const pacienteSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    age: z.number().int().min(0, "Edad inválida").max(200, "Edad inválida"),
    pathology: z.string().min(1, "Seleccionar patología"),
    feeling: z.enum(["good", "regular", "bad"]).optional(),
  });


  const FormSchema = z.object({
    patients: z.array(pacienteSchema).min(1),
  });

  type FormValues = z.infer<typeof FormSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      patients: [{ name: "", age: 0, pathology: "", feeling: undefined }],
    },
  });


  const { control, register, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "patients",
  });

// const addPatient = () => { append({ name: "", age: "", pathology: "", feeling: undefined }); };



    const onSubmit = (values: FormValues) => {
      // values.patients: Array<{ name: string; age: number; pathology: string; feeling?: ... }>
      console.log(values);
    };



  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(onSubmit)(e).catch((err) => { reportError(err); }) }} className="space-y-8 !font-inter">
        <h3 className="text-2xl font-bold tracking-normal leading-[1.4]" >
        Pacientes
        </h3>
        <div className="flex gap-4">
          {patientsCards.map((_, index) => (
          <Card key = {index} className="
            w-[510px] max-w-full sm:h-[325px]
            rounded-[20px]
            p-6    
            bg-[#F7F9FC]
            border-0            
            shadow-none              
          "
          >
            <CardContent className="px-0 space-y-8 text-[#2D3648]">
              <div className="w-[462px] flex gap-[24px] h-[72px]">
              <FormItem className="w-[327px] h-[72px] flex flex-col font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">
                <Label htmlFor={`patients.${index}.name`} className="text-sm h-[16px] leading-[20px]">Nombre</Label>
                <Input 
                  id={`patients.${index}.name`} 
                  className="h-[48px] border-2 border-[#CBD2E0] bg-[#FFFFFF]" 
                  {...register(`patients.${index}.name` as const)}
                />
              </FormItem>
              <FormItem className="w-[111px] h-[72px] flex flex-col">
                <Label htmlFor={`age-${index}`} className="text-sm h-[16px] leading-[20px] font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">Edad</Label>
                <Input 
                  id={`patients.${index}.age`} 
                  type="number" 
                  className="h-[48px] border-2 border-[#CBD2E0] bg-[#FFFFFF]" 
                  {...register(`patients.${index}.age` as const)}
                />
              </FormItem>
              </div>
              <FormField
                control={form.control}
                name={`patients.${index}.pathology`}
                render={({ field }) => (
              <FormItem className="w-[462px] sm:h-[72px] flex flex-col gap-[8px]">
                <Label htmlFor={`patients.${index}.pathology`} className="text-sm h-[16px] leading-[20px] font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">
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
                    <SelectValue placeholder={pathologys.length ? "Seleccionar" : "Cargando..."} />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      {pathologys.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          No hay patologías
                        </SelectItem>
                      ) : (
                        pathologys.map((pat) => (
                          <SelectItem key={pat.id} value={String(pat.id)}>
                            {pat.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>

              </FormItem>

                )}
              />
              <FormLabel className="w-[320px] h-[16px] font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">
                ¿Cómo se sintió el paciente?
              </FormLabel>
              <RadioGroup className="w-[296px] h-[24px] flex items-center gap-[24px]">
                <div className="w-[83px] h-[24px] flex items-center gap-[12px]">
                  <RadioGroupItem value="good" id="r1" className="w-4 h-4" />
                  <Label htmlFor="r1" className="text-sm leading-[16px]">Buena</Label>
                </div>
                <div className="w-[83px] h-[24px] flex items-center gap-[12px]">
                  <RadioGroupItem value="regular" id="r2" className="w-4 h-4" />
                  <Label htmlFor="r2" className="text-sm leading-[16px]">Regular</Label>
                </div>
                <div className="w-[83px] h-[24px] flex items-center gap-[12px]">
                  <RadioGroupItem value="bad" id="r3"  className="w-4 h-4"/>
                  <Label htmlFor="r3" className="text-sm leading-[16px]">Mala</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          ))}
          <Button variant="secondary" size="icon"  onClick = {addPatCard} className="!w-[44px] !h-[44px] rounded-[6px] !p-[12px] border-3 border-[#2D3648] bg-[#FFFFFF] flex items-center justify-center gap-[8px]">
            <Plus className="w-[20px] h-[20px]"/>
          </Button>
        </div>
        <h3 className="text-2xl font-bold tracking-normal leading-[1.4] font-inter" >
        Experiencias
        </h3>
        <div className="flex gap-4">
          {/* {patientsCards.map((_, index) => ( */}  {/*key = {index}*/}
           <Card className=" 
            w-[510px] max-w-full sm:h-[119px]
            rounded-[20px]
            p-6    
            bg-[#F7F9FC]
            border-0            
            shadow-none              
          "
          >
            <CardContent className="px-0 space-y-8 text-[#2D3648]">
            <FormLabel className="w-[320px] h-[16px] font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">
                ¿Cómo se sintió [Nombre del perro]?
              </FormLabel>
              <RadioGroup className="w-[296px] h-[24px] flex items-center gap-[24px]">
                <div className="w-[83px] h-[24px] flex items-center gap-[12px]">
                  <RadioGroupItem value="good" id="r1" className="w-4 h-4" />
                  <Label htmlFor="r1" className="text-sm leading-[16px]">Buena</Label>
                </div>
                <div className="w-[83px] h-[24px] flex items-center gap-[12px]">
                  <RadioGroupItem value="regular" id="r2" className="w-4 h-4" />
                  <Label htmlFor="r2" className="text-sm leading-[16px]">Regular</Label>
                </div>
                <div className="w-[83px] h-[24px] flex items-center gap-[12px]">
                  <RadioGroupItem value="bad" id="r3"  className="w-4 h-4"/>
                  <Label htmlFor="r3" className="text-sm leading-[16px]">Mala</Label>
                </div>
              </RadioGroup>
              </CardContent>
          </Card>
          {/* ))} */}
        </div>
        <h3 className="text-2xl font-bold tracking-normal leading-[1.4] font-inter" >
        Fotos
        </h3>
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
              name="picture"
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-hidden="true"
            />
          </label>

          <div className="absolute top-[12px] left-[296px] w-[24px] h-[24px]">
            <Upload className="w-[24px] h-[24px]" />
          </div>
        </div>
        
        <div className="w-[327px] h-[139px] ">
          <div className="w-[327px] h-[91px] gap-[8px] pb-[4px]">
            <FormLabel className="font-bold text-[16px] leading-[24px]">
              Link a más fotos
            </FormLabel>

            <FormDescription className="w-[327px] h-[63px] font-normal text-[14px] leading-[21px] tracking-[-0.01em]">
              Solo podés adjuntar tres, así que si necesitás <br/> subir más, podés dejar acá el link a Drive con el <br/> resto.
            </FormDescription>
          </div>

          {/* Input con margen superior para separar del texto */}
          <FormControl>
            <Input
              id="text"
              type="text"
              className="w-[327px] h-[40px] rounded-[6px] !p-[12px] border-2 border-[#CBD2E0]"
            />
          </FormControl>
        </div>


        {/* <h3 className="text-2xl font-bold tracking-normal leading-[1.4] font-inter" >
        Gastos
        </h3>
        <Card className="max-w-md p-6">

        </Card> */}


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