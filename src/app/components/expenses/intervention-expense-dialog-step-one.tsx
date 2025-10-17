import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { AlertCircleIcon, Check, ChevronsUpDown} from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { LoginContext } from "@/app/context/login-context";

export type Intervention = {
  intervensionId: string;
  type: string;
  timestamp: string;
  institutionId: string;
  institutionName: string;
};
interface InterventionComboboxProps {
  value?: string;
  onChange?: (val: string) => void;
}
export function InterventionCombobox({ value: propValue, onChange }: InterventionComboboxProps) {
    const [open, setOpen] = useState(false)
    const [internalValue, setInternalValue] = useState("");
    const value = propValue ?? internalValue;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const context = useContext(LoginContext);
    const token = context?.tokenJwt;
    const [data, setData] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (newValue: string) => {
        if (onChange) {
        onChange(newValue);
        } else {
        setInternalValue(newValue);
        }
    };
   useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/intervention/findall-simple",{
            headers:{
                Accept: "application/json",
                Authorization: `Bearer ${token}`
            },            
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = (await response.json()) as Intervention[];
        setData(result);
      }catch (err) {
        if (err instanceof Error) {
            setError(err.message); 
        } else {
            setError("Error desconocido");
        }
      }finally {
        setLoading(false);
      }
    };

    // eslint-disable-next-line no-console
    fetchData().catch(err => { console.error(err); });
  }, []);
  return (
    <div className="flex flex-col w-full">
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button ref={triggerRef} variant="outline" role="combobox" aria-expanded={open} className="justify-between">
                {value
                    ? (() => {
                        const selected = data.find((item) => item.intervensionId === value);
                        return selected
                        ? `${selected.institutionName} - ${selected.type} - ${new Date(selected.timestamp).toLocaleDateString("es-ES")}`
                        : "Seleccionar";
                    })()
                    : "Seleccionar"}
                <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full" style={{ width: triggerRef.current?.offsetWidth }}>
                {loading ? (
                <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>
                ) : error ? (
                <div className="p-4 text-center text-sm text-red-500">{error}</div>
                ) : (
                <Command>
                    <CommandList>
                    <CommandEmpty>No se encontraron Instituciones.</CommandEmpty>
                    <CommandGroup>
                        {data.map((item) => {
                        const label = `${item.institutionName} - ${item.type} - ${new Date(item.timestamp).toLocaleDateString("es-ES")}`;
                        return (
                            <CommandItem
                            key={item.intervensionId}
                            value={item.intervensionId}
                            onSelect={(currentId) => {
                                handleChange(currentId === value ? "" : currentId);
                                setOpen(false);
                            }}
                            >
                            {label}
                            <Check className={cn("ml-auto", value === item.intervensionId ? "opacity-100" : "opacity-0")} />
                            </CommandItem>
                        );
                        })}
                    </CommandGroup>
                    </CommandList>
                </Command>
                )}
            </PopoverContent>
        </Popover>
    </div>
  )
}
interface ExpenseDialogOneProps {
  open: boolean;
  selectedIntervention:string;
  onOpenChange: (open: boolean) => void;
  setSelectedIntervention: (id: string) => void;
  setOpenStepTwo: (open: boolean) => void;
}
export default function ExpenseDialogOne({
  open,
  selectedIntervention,
  onOpenChange,
  setSelectedIntervention,
  setOpenStepTwo,
}: ExpenseDialogOneProps) {
    //const confirmedRef = useRef(false);
    return (
        
        <div>
            <Dialog 
                open={open} 
                onOpenChange={onOpenChange}
                /*onOpenChange={(isOpen) => {
                    if (!isOpen && !confirmedRef.current) {
                    setSelectedIntervention("");
                    }
                    if (!isOpen) {
                    confirmedRef.current = false;
                    }
                    onOpenChange(isOpen);
                }}*/
                >
                <DialogOverlay className="fixed inset-0 z-50 !bg-black/50" />
                <DialogTrigger className="px-2">
                        Gasto en intervención            
                </DialogTrigger>
                <DialogContent className="flex flex-col gap-3">
                    <DialogHeader>
                        <DialogTitle className="font-semibold text-lg leading-[100%] tracking-[-0.025em]">
                            Gasto en intervención
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="grid border border-red-500 rounded-md p-2 w-full">
                                <div className="flex">
                                    <AlertCircleIcon className="text-red-500 mr-1" />{" "}
                                    <p className="text-red-500">Si el gasto no lo realizaste para trasladar a un perro, no lo pases por favor.</p>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="w-full m-0">
                        <span className="font-inter font-semibold text-[14px] leading-[16px] tracking-[-0.01em] text-[#2D3648]">
                            Intervención
                        </span>
                        <InterventionCombobox
                            value={selectedIntervention}
                            onChange={setSelectedIntervention}
                        />
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
                                    onClick={() => {
                                        //confirmedRef.current = true; 
                                        setOpenStepTwo(true); 
                                    }}
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
        </div>
    );
}