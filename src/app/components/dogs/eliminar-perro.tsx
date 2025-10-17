"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";
import ConfirmDelete from "../confirm-delete";

type ApiResponse = {
  success: boolean;
  message: string;
  status: number;
};

export default function EliminarPerro() {
  const searchParams = useSearchParams();
  const id: string = searchParams.get("id") ?? "";
  const router = useRouter();

  const context = useContext(LoginContext);

  async function handleDelete(): Promise<void> {
    try {
      const makeDelete = async (bearer?: string) => {
        const headers: Record<string, string> = {
          Accept: "application/json",
          ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        };
        const res = await fetch(`/api/perros?id=${encodeURIComponent(id)}`, {
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

      const data = (await res.json().catch(() => null)) as ApiResponse | null;

      if (res.ok && data?.success) {
        toast.success(`Perro eliminado correctamente.`, {
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

        try {
          await context?.refreshPerros?.();
        } catch {
          // ignore refresh errors
        }

        router.push("/app/admin/perros/listado");
      } else {
        toast.error(`No se pudo eliminar al perro.`, {
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
      toast.error(`No se pudo eliminar al perro.`, {
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
      <ConfirmDelete handleAction={handleDelete} title="¿Eliminar perro?">
        {(open) => (
          <Button
            type="button"
            className="flex items-center gap-1 w-[141px] h-10 min-w-[80px] rounded-md px-3 py-2 bg-red-600 text-white opacity-100"
            onClick={open}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Perro
          </Button>
        )}
      </ConfirmDelete>
    </>
  );
}
