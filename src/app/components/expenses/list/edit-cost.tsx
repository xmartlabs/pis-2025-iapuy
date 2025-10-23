import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWatch, useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InterventionCombobox } from "@/app/components/expenses/intervention-expense-dialog-step-one";
import { AlertCircleIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  forwardRef,
} from "react";
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";

type PersonA = { userCi: string; userName: string };
type PersonB = { userId: string; nombre: string };
type Person = PersonA | PersonB;

interface ComboboxProps {
  readonly value: string;
  readonly onChange: (val: string) => void;
  readonly people: readonly Person[];
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}

const getPersonId = (p: Person) => ("userCi" in p ? p.userCi : p.userId);
const getPersonLabel = (p: Person) => ("userName" in p ? p.userName : p.nombre);

type MeasurementProps = {
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
};

const MeasurementComboBox = ({
  value: propValue,
  onChange,
  disabled,
}: MeasurementProps) => {
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
      <PopoverContent
        className="p-0 w-full"
        style={{ width: triggerRef.current?.offsetWidth }}
      >
        <Command>
          <CommandList>
            <CommandEmpty>No se encontraron opciones</CommandEmpty>
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
};
function PeopleComboBox({ value: propValue, onChange, people }: ComboboxProps) {
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
            {(() => {
              const found = people.find(
                (person) => getPersonId(person) === propValue
              );
              return found
                ? getPersonLabel(found)
                : "[Nombre guía o acompañante]";
            })()}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-full"
          style={{ width: triggerRef.current?.offsetWidth }}
        >
          <Command>
            <CommandList>
              <CommandEmpty>No se encontraron personas</CommandEmpty>
              <CommandGroup>
                {people.map((person) => {
                  const id = getPersonId(person);
                  const label = getPersonLabel(person);
                  return (
                    <CommandItem
                      key={id}
                      value={id}
                      onSelect={(currentValue) => {
                        onChange?.(
                          currentValue === propValue ? "" : currentValue
                        );
                        setOpen(false);
                      }}
                    >
                      {label}
                      <Check
                        className={cn(
                          "ml-auto",
                          propValue === id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
interface Props {
  InterventionID: string;
  onSubmit?: (data: z.infer<typeof FormSchema>) => void;
  hideIntervention?: boolean;
  initialData?: Partial<z.infer<typeof FormSchema>>;
}
export const FormSchema = z.object({
  interventionID: z.string(),
  peopleCI: z.string(),
  type: z.string(),
  measurementType: z.string(),
  amount: z
    .number()
    .positive({ message: "Debe ingresar una cantidad de KM válida." }),
});
export const ExpenseForm = forwardRef<HTMLFormElement, Props>(
  ({ InterventionID, onSubmit, hideIntervention, initialData }, ref) => {
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      defaultValues: {
        interventionID: InterventionID,
        peopleCI: "",
        type: "Traslado",
        amount: 1,
        measurementType: "KM",
      },
    });

    useEffect(() => {
      if (!initialData) return;
      try {
        const vals: Partial<z.infer<typeof FormSchema>> = {};
        if (initialData.interventionID)
          vals.interventionID = String(initialData.interventionID);
        if (initialData.peopleCI) vals.peopleCI = String(initialData.peopleCI);
        if (initialData.type) vals.type = String(initialData.type);
        if (typeof initialData.amount === "number")
          vals.amount = initialData.amount;
        if (initialData.measurementType)
          vals.measurementType = String(initialData.measurementType);

        form.reset({ ...form.getValues(), ...vals });
        setTimeout(() => {
          if (vals.interventionID)
            form.setValue("interventionID", vals.interventionID);
          if (vals.peopleCI) form.setValue("peopleCI", vals.peopleCI);
          if (vals.type) form.setValue("type", vals.type);
          if (typeof vals.amount === "number")
            form.setValue("amount", vals.amount);
          if (vals.measurementType)
            form.setValue("measurementType", vals.measurementType);
        }, 0);
      } catch {
        /* ignore */
      }
    }, [initialData, form]);

    const selectedType = useWatch({ control: form.control, name: "type" });
    const [people, setPeople] = useState<
      { userCi: string; userName: string }[]
    >([]);

    const isTraslado = selectedType === "Traslado";
    const selectedMeasurementType = useWatch({
      control: form.control,
      name: "measurementType",
    });

    const context = useContext(LoginContext);
    const token = context?.tokenJwt;

    useEffect(() => {
      if (!InterventionID) {
        setPeople([]);
        return;
      }

      const url = `/api/intervention/collaborators-for-expense?interventionId=${encodeURIComponent(
        InterventionID
      )}`;

      const fetchWithToken = (t?: string) => {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (t) headers.Authorization = `Bearer ${t}`;
        return fetch(url, {
          headers,
          credentials: "include",
        });
      };

      const doFetch = async () => {
        try {
          let res = await fetchWithToken(token ?? undefined);

          if (res.status === 401) {
            // try refresh
            const refreshRes = await fetch("/api/auth/refresh", {
              method: "GET",
              credentials: "include",
            });

            if (refreshRes.ok) {
              const refreshData = (await refreshRes.json()) as Record<
                string,
                unknown
              >;
              const newToken =
                (refreshData.accessToken as string | undefined) ??
                (refreshData.token as string | undefined) ??
                (refreshData.tokenJwt as string | undefined) ??
                null;

              const ctx = context as {
                setTokenJwt?: (t: string) => void;
              } | null;
              if (newToken && ctx && typeof ctx.setTokenJwt === "function") {
                try {
                  ctx.setTokenJwt?.(newToken);
                } catch {
                  /* ignore setter failure */
                }
              }

              res = await fetchWithToken(newToken ?? undefined);
            } else {
              setPeople([]);
              return;
            }
          }

          if (res.ok) {
            const data = (await res.json()) as {
              userCi: string;
              userName: string;
            }[];
            setPeople(Array.isArray(data) ? data : []);
          } else {
            setPeople([]);
          }
        } catch {
          setPeople([]);
        }
      };

      doFetch().catch(() => {});
    }, [InterventionID, token, context]);

    const handleFormSubmit = (data: z.infer<typeof FormSchema>) => {
      if (onSubmit) {
        onSubmit(data);
      }
    };
    return (
      <FormProvider {...form}>
        <Form {...form}>
          <form
            ref={ref}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col gap-6 w-full"
          >
            {!hideIntervention && (
              <FormField
                control={form.control}
                name="interventionID"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 relative">
                    <FormControl>
                      <div className="pointer-events-none opacity-50">
                        <InterventionCombobox
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="absolute -bottom-6" />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="peopleCI"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2 relative">
                  <FormControl>
                    <PeopleComboBox
                      value={field.value}
                      onChange={field.onChange}
                      people={people}
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
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value as string | undefined}
                    >
                      <div className="flex items-center">
                        <RadioGroupItem value="Traslado" id="option-true" />
                        <Label htmlFor="option-true" className="ml-2">
                          Traslado
                        </Label>
                      </div>

                      <div className="flex items-center">
                        <RadioGroupItem
                          value="Estacionamiento/Taxi"
                          id="option-false"
                        />
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
                        <Label
                          className="text-sm font-medium text-gray-700 mb-2"
                          htmlFor="amount"
                        >
                          {selectedMeasurementType === "Pesos"
                            ? "Monto"
                            : "Cantidad de KM"}
                        </Label>
                        <FormControl>
                          <Input
                            id="amount"
                            type="number"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.valueAsNumber);
                            }}
                          />
                        </FormControl>
                        {selectedMeasurementType === "KM" && (
                          <Label className="text-xs text-gray-500 mt-2">
                            Equivalente en pesos uruguayos
                          </Label>
                        )}
                        <FormMessage className="mt-1" />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </FormProvider>
    );
  }
);
ExpenseForm.displayName = "ExpenseForm";
interface Props2 {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly costID: string;
  readonly onEdited: () => void;
}

export default function EditCostNotSanity({
  open,
  onOpenChange,
  costID,
  onEdited,
}: Props2) {
  const [submitting, setSubmitting] = useState(false);
  const context = useContext(LoginContext);
  const token = context?.tokenJwt;
  const formRef = useRef<HTMLFormElement>(null);

  const [initialData, setInitialData] = useState<Partial<
    z.infer<typeof FormSchema>
  > | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (data: z.infer<typeof FormSchema>) => {
    if (!submitting) {
      setSubmitting(true);
      try {
        const params = new URLSearchParams();
        params.set("id", costID);
        const res = await fetch(`/api/expenses?${params.toString()}`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            interventionId: data.interventionID,
            userId: data.peopleCI || "",
            type: data.type,
            amount: data.amount,
          }),
        });

        if (res.status === 204 || res.ok) {
          onOpenChange(false);
          onEdited();
        } else {
          toast.error("Error al editar el gasto. Intente nuevamente.");
        }
      } catch {
        toast.error("Error al editar el gasto. Intente nuevamente.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // load expense details when dialog opens and a costID is provided
  useEffect(() => {
    if (!open || !costID) return;
    let mounted = true;

    const doFetch = async (withRetry = true): Promise<void> => {
      try {
        setLoading(true);
        const headers: Record<string, string> = { Accept: "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(
          `/api/expenses/details?id=${encodeURIComponent(costID)}`,
          { headers }
        );

        if (res.status === 401 && withRetry) {
          const resp2 = await fetch("/api/auth/refresh", { method: "POST" });
          if (resp2.ok) {
            await doFetch(false);
            return;
          }
        }

        if (!res.ok) {
          if (mounted) setInitialData(null);
          return;
        }

        const json: unknown = await res.json();

        const raw = json;
        let expenseRecord: Record<string, unknown> | null = null;
        if (raw && typeof raw === "object") {
          const maybe = raw as Record<string, unknown>;
          if (
            "expense" in maybe &&
            maybe.expense &&
            typeof maybe.expense === "object"
          ) {
            expenseRecord = maybe.expense as Record<string, unknown>;
          } else {
            expenseRecord = maybe;
          }
        }

        function pickFirstString(
          rec: Record<string, unknown> | null,
          ...keys: string[]
        ): string | undefined {
          if (!rec) return undefined;
          for (const k of keys) {
            const v = rec[k];
            if (typeof v === "string" || typeof v === "number")
              return String(v);
          }
          return undefined;
        }

        const out: Partial<z.infer<typeof FormSchema>> = {};
        if (expenseRecord) {
          const idVal = pickFirstString(
            expenseRecord,
            "interventionId",
            "interventionID"
          );
          if (idVal) out.interventionID = idVal;

          const userVal = pickFirstString(expenseRecord, "userId", "userCi");
          if (userVal) out.peopleCI = userVal;

          const typeVal = pickFirstString(expenseRecord, "type");
          if (typeVal) {
            const low = typeVal.toLowerCase();
            if (low.includes("traslad")) out.type = "Traslado";
            else if (low.includes("estacion") || low.includes("taxi"))
              out.type = "Estacionamiento/Taxi";
            else out.type = typeVal;
          }

          const amountRaw = expenseRecord.amount;
          if (typeof amountRaw === "number") {
            out.amount = amountRaw;
          } else if (typeof amountRaw === "string") {
            const parsed = Number(amountRaw.trim());
            if (!Number.isNaN(parsed)) out.amount = parsed;
          }

          const measVal = pickFirstString(
            expenseRecord,
            "measurementType",
            "measurement",
            "measurement_type",
            "medicion",
            "medida"
          );
          if (measVal) {
            const mlow = String(measVal).toLowerCase();
            if (mlow === "km" || mlow === "kms" || mlow.includes("km")) {
              out.measurementType = "KM";
            } else if (
              mlow.includes("peso") ||
              mlow.includes("$") ||
              mlow.includes("uy") ||
              mlow.includes("pesos")
            ) {
              out.measurementType = "Pesos";
            } else {
              // fallback to raw value so the form still receives something sensible
              out.measurementType = String(measVal);
            }
          } else {
            // default: Traslado -> KM, else Pesos
            out.measurementType = out.type === "Traslado" ? "KM" : "Pesos";
          }
        }

        if (mounted) setInitialData(out);
      } catch {
        if (mounted) setInitialData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    doFetch(true).catch(() => {});
    // eslint-disable-next-line
    return () => {
      mounted = false;
    };
  }, [open, costID, token]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[500px] max-w-full">
        <DialogHeader>
          <DialogTitle className="font-sans font-semibold text-lg mb-6">
            Gasto en Intervención
          </DialogTitle>
          <DialogDescription asChild>
            <div className="grid border border-red-500 rounded-md p-2 w-full mb-6">
              <div className="flex">
                <AlertCircleIcon className="text-red-500 mr-1" />
                <p className="text-red-500">
                  Solo subí el gasto si lo realizaste para trasladar a un perro.
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <ExpenseForm
          InterventionID={initialData?.interventionID ?? ""}
          initialData={initialData ?? undefined}
          hideIntervention={false}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={submit}
          ref={formRef}
        />

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 w-full mt-8">
          <DialogClose asChild>
            <Button className="min-w-[80px] rounded-md border border-[#BDD7B3] py-2 px-3 text-[#5B9B40] bg-white">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            className="min-w-[80px] rounded-md border border-[#BDD7B3] py-2 px-3 bg-[#5B9B40] text-white"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={loading || submitting}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
