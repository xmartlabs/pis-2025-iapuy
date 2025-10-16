import {
  Dialog,
  DialogContent,
  //DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useContext, useEffect,useState,useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { LoginContext } from "@/app/context/login-context";
function Combobox() {
    const frameworks = [
        {
            value: "next.js",
            label: "Next.js",
        },
        {
            value: "sveltekit",
            label: "SvelteKit",
        },
        {
            value: "nuxt.js",
            label: "Nuxt.js",
        },
        {
            value: "remix",
            label: "Remix",
        },
        {
            value: "astro",
            label: "Astro",
        },
    ]
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const triggerRef = useRef<HTMLButtonElement>(null);
  const context = useContext(LoginContext);
  const token = context?.tokenJwt;
  //const [data, setData] = useState<any[]>([]);
  //const [loading, setLoading]:boolean = useState(true);
  //const [error, setError] = useState<string | null>(null);
   useEffect(() => {
    // función async dentro de useEffect
    const fetchData = async () => {
      try {
        //setLoading(true);
        //setError(null);
        const response = await fetch("https://api.example.com/items",{
            method: "GET",
            headers:{
                Accept: "application/json",
                Authorization: `Bearer ${token}`
            },            
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        //const result = await response.json();

        //setData(result);
      } /*catch (err: any) {
        //setError(err.message || "Error desconocido");
      }*/ finally {
        //setLoading(false);
      }
    };

    // eslint-disable-next-line no-console
    fetchData().catch(err => { console.error(err); });
  }, []);
  return (
    <div className="flex flex-col w-full">
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                ref={triggerRef}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="justify-between"
                >
                {value
                    ? frameworks.find((framework) => framework.value === value)?.label
                    : "Seleccionar"}
                <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="p-0 w-full"
                style={{ width: triggerRef.current?.offsetWidth }}
            >
                <Command>
                <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                    {frameworks.map((framework) => (
                        <CommandItem
                        key={framework.value}
                        value={framework.value}
                        onSelect={(currentValue) => {
                            setValue(currentValue === value ? "" : currentValue)
                            setOpen(false)
                        }}
                        >
                        {framework.label}
                        <Check
                            className={cn(
                            "ml-auto",
                            value === framework.value ? "opacity-100" : "opacity-0"
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
  )
}
export default function ExpenseDialog(){
    return (
        <Dialog>
            <DialogOverlay className="fixed inset-0 z-50 bg-black/50" />
            <DialogTrigger className="px-2">
                    Gasto en intervención            
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-semibold text-lg leading-[100%] tracking-[-0.025em]">
                        Gasto en intervención
                    </DialogTitle>
                    {/*<DialogDescription asChild>
                        
                    </DialogDescription>*/}
                </DialogHeader>
                <div className="w-full">
                    <span className="font-inter font-semibold text-[14px] leading-[16px] tracking-[-0.01em] text-[#2D3648]">
                        Intervención
                    </span>
                    <Combobox/>
                </div>
                <DialogFooter>
                    <div className="flex justify-between w-full">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                className="w-[80px] h-[40px] flex-none rounded-md bg-white border border-[#BDD7B3] 
                                                        text-[#5B9B40] text-sm font-medium leading-6 tracking-normal 
                                                        hover:bg-[#EFF5EC] transition-colors"
                            >
                                Volver
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button
                                //onClick={}
                                className="min-w-[80px] h-[40px] flex-none rounded-md bg-[#5B9B40] text-white text-sm font-medium 
                                                        leading-6 tracking-normal hover:bg-[#4F8736] transition-colors px-4 py-2 flex items-center gap-2"
                                >
                                Confirmar
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}