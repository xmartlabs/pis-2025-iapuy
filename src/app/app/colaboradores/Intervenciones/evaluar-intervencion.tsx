"use client"

import { Form, FormControl, FormDescription, FormItem, FormLabel  } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
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



export default function EvaluarIntervencion() {


    const formSchema = z.object({
            username: z.string().min(2, {
                message: "Username must be at least 2 characters.",
        }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        username: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 !font-inter">
        <h3 className="text-2xl font-bold tracking-normal leading-[1.4]" >
        Pacientes
        </h3>
        <div className="flex gap-4">
          <Card className="
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
                <Label htmlFor="name" className="text-sm h-[16px] leading-[20px]">Nombre</Label>
                <Input id="name" className="h-[48px] border-2 border-[#CBD2E0] bg-[#FFFFFF]" />
              </FormItem>
              <FormItem className="w-[111px] h-[72px] flex flex-col">
                <Label htmlFor="age" className="text-sm h-[16px] leading-[20px] font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">Edad</Label>
                <Input id="age" type="number" className="h-[48px] border-2 border-[#CBD2E0] bg-[#FFFFFF]" />
              </FormItem>
              </div>
              <FormItem className="w-[462px] sm:h-[72px] flex flex-col gap-[8px]">
                <Label htmlFor="patology" className="text-sm h-[16px] leading-[20px] font-semibold text-[14px] leading-[16px] tracking-[-0.01em]">Patología</Label>
                <Select>
                  <SelectTrigger className="w-full !h-[48px] rounded-[6px] border-2 border-gray-200 bg-white border-2 border-[#CBD2E0]">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="blueberry">Blueberry</SelectItem>
                      <SelectItem value="grapes">Grapes</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
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
          <Button variant="secondary" size="icon" className="!w-[44px] !h-[44px] rounded-[6px] !p-[12px] border-2 border-[#2D3648] bg-[#FFFFFF] flex items-center justify-center gap-[8px]">
            <Plus className="w-[20px] h-[20px] opacity-100 rotate-0"/>
          </Button>
        </div>
        <h3 className="text-2xl font-bold tracking-normal leading-[1.4] font-inter" >
        Experiencias
        </h3>
        <div className="flex gap-4">
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
} 