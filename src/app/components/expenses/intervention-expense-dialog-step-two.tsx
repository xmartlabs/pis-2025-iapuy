import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWatch,useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {InterventionCombobox} from "@/app/components/expenses/intervention-expense-dialog-step-one"
import { AlertCircleIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface ComboboxProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}
function PeopleComboBox({ value: propValue, onChange }: ComboboxProps) {
  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
  ];

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="flex flex-col w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <Label className="mb-2">¿Quién realizó el gasto?</Label>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {propValue
              ? frameworks.find((framework) => framework.value === propValue)?.label
              : "[Nombre guía o acompañante]"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full" style={{ width: triggerRef.current?.offsetWidth }}>
          <Command>
            <CommandList>
              <CommandEmpty>No se encontraron personas</CommandEmpty>
              <CommandGroup>
                {frameworks.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      onChange?.(currentValue === propValue ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {framework.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        propValue === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
const MeasurementComboBox =({ value: propValue, onChange,disabled }: ComboboxProps)=>{
  const measurement = [
    { value: "KM", label: "KM" },
    { value: "Pesos", label: "Pesos" },
  ];
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
          disabled={disabled}
        >
          {propValue
            ? measurement.find((item) => item.value === propValue)?.label
            : "KM"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full" style={{ width: triggerRef.current?.offsetWidth }}>
        <Command>
          <CommandList>
            <CommandEmpty>No se encontraron personas</CommandEmpty>
            <CommandGroup>
              {measurement.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    onChange?.(currentValue === propValue ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      propValue === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
interface Props{
    InterventionID:string,
}
export function ExpenseForm({ InterventionID }: Props) {
  const FormSchema = z.object({
    interventionID: z
        .string(),
    peopleCI: z.string(),
    type:z.boolean(),
    measurementType:z.string(),
    amount:z.number()
    .positive({ message: "Debe ingresar una cantidad de KM válida." }),
  });
  const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: { interventionID: InterventionID, peopleCI: "",type:true,amount:0},
  });
  const selectedType = useWatch({ control: form.control, name: "type" })
  const isTraslado = selectedType === true
  const selectedMeasurementType = useWatch({ control: form.control, name: "measurementType" })
  useEffect(() => {
    if (!selectedType) {
      form.setValue("measurementType", "$");
    }
  }, [selectedType, form]);
  return(
    <Form {...form}>
      <form className="flex flex-col gap-6 w-full">
        <FormField
          control={form.control}
          name="interventionID"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 relative">
              <FormControl>
                <InterventionCombobox
                value={field.value}
                onChange={field.onChange}
                />
              </FormControl>
              <FormMessage className="absolute -bottom-6" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="peopleCI"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 relative">
              <FormControl>
                <PeopleComboBox
                    value={field.value}
                    onChange={field.onChange}
                />
              </FormControl>
              <FormMessage className="absolute -bottom-6" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 relative">
              <FormControl>
                <RadioGroup
                  className="flex flex-row gap-6"
                  onValueChange={(value) => { field.onChange(value === "true"); }}
                  value={field.value ? "true" : "false"}
                >
                  <div className="flex items-center">
                    <RadioGroupItem value="true" id="option-true" />
                    <Label htmlFor="option-true" className="ml-2">
                      Traslado
                    </Label>
                  </div>

                  <div className="flex items-center">
                    <RadioGroupItem value="false" id="option-false" />
                    <Label htmlFor="option-false" className="ml-2">
                      Estacionamiento/Taxi
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage className="absolute -bottom-6" />
            </FormItem>
          )}
        />
        <div className="flex flex-row gap-6 w-full items-start">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="measurementType"
              render={({ field }) => (
                <FormItem className="flex flex-col !gap-0 !p-0 !m-0">
                  <Label className="text-sm font-medium text-gray-700 mb-2">
                    Medición
                  </Label>
                  <FormControl>
                    <MeasurementComboBox
                      value={isTraslado ? field.value : "Pesos"}
                      onChange={isTraslado ? field.onChange : () => {}}
                      disabled={!isTraslado}
                    />
                  </FormControl>
                  <FormMessage className="mt-1" />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            {isTraslado ? (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                <FormItem className="flex flex-col !gap-0 !p-0 !m-0">
                  <Label className="text-sm font-medium text-gray-700 mb-2" htmlFor="amount">
                    {selectedMeasurementType === "Pesos" ? "Monto" : "Cantidad de KM"}
                  </Label>
                  <FormControl>
                    <Input
                      id="amount"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  {selectedMeasurementType === "KM" && (
                    <Label className="text-xs text-gray-500 mt-2">Equivalente en pesos uruguayos</Label>
                  )}
                  <FormMessage className="mt-1" />
                </FormItem>
              )}/>
              ) : (
                <div></div>
                /*
                <button className="w-full px-4 py-2 bg-[#5B9B40] text-white rounded-md hover:bg-[#4D8B36]">Acción</button>
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1 relative">
                      <FormControl>
                        <Input id="amount" value="$" disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />*/
              )}
          </div>
        </div>          
      </form>
    </Form>
  )
}
interface Props2 {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  InterventionID: string;
}
export default function ExpenseDialogTwo({ open, onOpenChange, InterventionID }: Props2) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-full">
        <DialogHeader>
          <DialogTitle className="font-sans font-semibold text-lg leading-[100%] tracking-[-0.025em] mb-6">
            Gasto en Intervención
          </DialogTitle>
          <DialogDescription asChild>
              <div className="grid border border-red-500 rounded-md p-2 w-full mb-6">
                  <div className="flex">
                      <AlertCircleIcon className="text-red-500 mr-1" />{" "}
                      <p className="text-red-500">Solo subí el gasto si lo realizaste para trasladar a un perro.</p>
                  </div>
              </div>
          </DialogDescription>
        </DialogHeader>

        <ExpenseForm InterventionID={InterventionID} />

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 w-full mt-8">
          <DialogClose asChild>
            <Button className="min-w-[80px] rounded-md border border-[#BDD7B3] py-2 px-3 opacity-100 rotate-0 bg-color-white font-sans font-medium text-sm leading-6 tracking-normal text-[#5B9B40] ">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className="min-w-[80px] rounded-md border border-[#BDD7B3] py-2 px-3 opacity-100 rotate-0 bg-[#5B9B40] font-sans font-medium text-sm leading-6 tracking-normal">Confirmar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
