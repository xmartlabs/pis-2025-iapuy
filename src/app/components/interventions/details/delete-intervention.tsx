import { LoginContext } from "@/app/context/login-context";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { toast } from "sonner";
import ConfirmDelete from "../../confirm-delete";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

type ApiResponse = {
  message?: string;
  error?: string;
  status: string;
};

export default function DeleteIntervention({
  interventionId,
}: {
  interventionId: string;
}) {
  const router = useRouter();
  const context = useContext(LoginContext)!;

  async function handleDelete(): Promise<void> {
    try {
      const res = await fetchWithAuth(
        context,
        `/api/intervention?id=${encodeURIComponent(interventionId)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = (await res.json().catch(() => null)) as ApiResponse | null;

      if (res.ok && !data?.error) {
        toast.success(`Intervención eliminada correctamente.`, {
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
        router.push("/app/admin/intervenciones/listado");
      } else {
        toast.error(`No se pudo eliminar la intervención.`, {
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
      toast.error(`No se pudo eliminar la intervención.`, {
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
  return (
    <>
      <ConfirmDelete
        handleAction={handleDelete}
        title="¿Eliminar intervención?"
      >
        {(open) => (
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white flex items-center"
            onClick={open}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar intervención
          </Button>
        )}
      </ConfirmDelete>
    </>
  );
}
