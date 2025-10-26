import { type ListExpenseDto } from "@/app/api/expenses/dtos/list-expense.dto";
import { useContext, useEffect, useState } from "react";
import { LoginContext } from "@/app/context/login-context";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function DeleteExpenseDialog({
  open,
  exp,
  onClose,
  onSuccess,
}: {
  open: boolean;
  exp: ListExpenseDto;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [dogName, setDogName] = useState("");
  const context = useContext(LoginContext);

  async function handleDelete(): Promise<void> {
    if (isDeleting) return;
    const url = `/api/expenses?id=${encodeURIComponent(exp.id)}`;
    setIsDeleting(true);
    try {
      const makeDelete = async (bearer?: string) => {
        const headers: Record<string, string> = {
          Accept: "application/json",
          ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        };
        const res = await fetch(url, {
          method: "DELETE",
          headers,
        });
        return res;
      };

      const token = context?.tokenJwt ?? undefined;
      let res = await makeDelete(token);

      if (res.status === 401) {
        const refreshResp = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (refreshResp.ok) {
          const body = (await refreshResp.json().catch(() => null)) as {
            accessToken?: string;
          } | null;
          const newToken = body?.accessToken ?? null;
          if (newToken) {
            context?.setToken(newToken);
            res = await makeDelete(newToken);
          }
        }
      }

      if (res.ok) {
        toast.success(`Gasto eliminado correctamente.`, {
          duration: 5000,
          icon: null,
          className:
            "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md w font-sans font-semibold text-sm leading-5 tracking-normal",
          style: {
            background: "#DEEBD9",
            border: "1px solid #BDD7B3",
            color: "#121F0D",
          },
        });

        onSuccess?.();
        onClose();
      } else {
        toast.error(`No se pudo eliminar al Gasto.`, {
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
    } catch {
      toast.error(`No se pudo eliminar al gasto.`, {
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
    } finally {
      setIsDeleting(false);
    }
  }

  useEffect(() => {
    if (open) {
      setDogName(exp.dogName || "");
    } else {
      setDogName("");
    }
  }, [exp.dogName, exp.id, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
                        mt-27 !w-[90%] !max-w-[720px] !box-border !px-4 !md:px-6
                        !h-auto !md:h-[362px] !max-h-[80vh] !overflow-y-auto !overflow-x-hidden
                        !bg-white !border !border-[#D4D4D4] !rounded-md
                        !top-[50%] md:!top-[228px] !left-1/2 !-translate-x-1/2
                    "
      >
        <DialogHeader className="!w-full !my-4  !items-center">
          <DialogTitle className="!font-sans !font-semibold !text-lg !text-black !w-full !text-left">
            Eliminar Gasto
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirmación para eliminar el gasto seleccionado
          </DialogDescription>
        </DialogHeader>
        <div>
          {(exp.type === "Baño" ||
            exp.type === "Vacunacion" ||
            exp.type === "Desparasitacion Interna" ||
            exp.type === "Desparasitacion Externa") && (
            <p className="text-sm text-muted-foreground">
              Este registro también va a eliminarse del perfil del perro{" "}
              {dogName || "[Cargando nombre...]"}.
            </p>
          )}
          {(exp.type === "Traslados" ||
            exp.type === "Estacionamiento/Taxi") && (
            <p className="text-sm text-muted-foreground">
              El gasto también va a eliminarse de la intervención
              {exp.fecha
                ? `${new Date(exp.fecha).toLocaleDateString("es-UY", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })} ${new Date(exp.fecha).toLocaleTimeString("es-UY", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "sin fecha"}
              .
            </p>
          )}
          {(exp.type === "Pago a guía" ||
            exp.type === "Pago a acompañante") && (
            <p className="text-sm text-muted-foreground">
              Este [Guía/Acompañante] también va a eliminarse de la intervención{" "}
              {exp.fecha
                ? `${new Date(exp.fecha).toLocaleDateString("es-UY", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })} ${new Date(exp.fecha).toLocaleTimeString("es-UY", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "sin fecha"}
              .
            </p>
          )}
        </div>
        <DialogFooter className="!w-full !flex flex-col md:flex-row !items-center md:items-center !justify-between gap-3 mt-2 px-0">
          <DialogClose asChild>
            <Button
              onClick={onClose}
              variant="outline"
              className="
                                                w-full md:w-[96px] md:h-[40px] h-10 text-sm px-3 py-2 rounded-md
                                                border-[#5B9B40] text-[#5B9B40] bg-white
                                                hover:bg-[#edd4d1] hover:text-[#bd2717] hover:border-[#bd2717] transition-colors
                                            "
            >
              Cancelar
            </Button>
          </DialogClose>

          <Button
            type="submit"
            onClick={() => {
              handleDelete().catch(() => {
                // Error already handled in handleDelete
              });
            }}
            disabled={isDeleting}
            className="
                                            w-full md:w-[96px] md:h-[40px] !h-10 
                                            !font-sans !font-medium text-sm !leading-6 
                                            !tracking-normal !px-3 !py-2 !rounded-md !flex 
                                            !items-center !justify-center !gap-1 !bg-[#5B9B40] 
                                            !text-white !hover:bg-[#4b8034]
                                        "
          >
            {isDeleting ? "Eliminando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
