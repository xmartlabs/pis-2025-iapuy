//import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  //FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {InterventionCombobox} from "@/app/components/expenses/intervention-expense-dialog-step-one"
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PeopleComboboxProps {
  value: string;
  onChange: (val: string) => void;
}
function PeopleComboBox({ value: propValue, onChange }: PeopleComboboxProps) {
  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
  ];

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {propValue
            ? frameworks.find((framework) => framework.value === propValue)?.label
            : "[Nombre guía o acompañante]"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
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
        amountKM:z.number()
        .positive({ message: "Debe ingresar una cantidad de KM válida." }),
    });
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { interventionID: InterventionID, peopleCI: "",type:true,amountKM:0},
    });
    return(
        <Form {...form}>
            <form>
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
          <DialogTitle className="text-lg font-semibold">Registrar Gasto en Intervención</DialogTitle>
        </DialogHeader>

        <ExpenseForm InterventionID={InterventionID} />

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="default">Confirmar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
