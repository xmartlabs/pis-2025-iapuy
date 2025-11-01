"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react"; // icon library
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EliminarUsuarioProps {
  ci: string;
}

export const BotonEliminarUsuario: React.FC<EliminarUsuarioProps> = ({
  // eslint-disable-next-line react/prop-types
  ci,
}) => {
  const context = useContext(LoginContext)!;
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteUser = async (ciu: string): Promise<void> => {
    try {
      const resp = await fetchWithAuth(context, `/api/users?ci=${ciu}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(
          `API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`
        );
      }

      toast.success(`¡ Usuario eliminado con éxito !`, {
        duration: 5000,
        icon: null,
        className:
          "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md font-sans font-semibold text-sm leading-5 tracking-normal",
        style: {
          background: "#DEEBD9",
          border: "1px solid #BDD7B3",
          color: "#121F0D",
        },
      });

      router.push("/app/admin/personas/listado");
    } catch (err) {
      toast.error("Error eliminando usuario", {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2 px-6 py-3 w-[159px] h-[40px]">
          <Trash2 className="w-5 h-5" />
          <span>Eliminar persona</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogDescription>
            ¿Estás seguro que deseas eliminar este usuario?
            <br />
            <strong>
              También se eliminarán todos los perros asociados a esta persona.
            </strong>
            <br />
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsDialogOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteUser(ci).catch((e) => {
                toast.error(
                  `No se pudo eliminar al usuario, intentelo de nuevo.`,
                  {
                    duration: 5000,
                    icon: null,
                    className:
                      "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md w font-sans font-semibold text-sm leading-5 tracking-normal",
                    style: {
                      background: "#cfaaaaff",
                      border: "1px solid #ec0909ff",
                      color: "#ec0909ff",
                    },
                  }
                );
                throw e;
              });
              setIsDialogOpen(false);
            }}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
