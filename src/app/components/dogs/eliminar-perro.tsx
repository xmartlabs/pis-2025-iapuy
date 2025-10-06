"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContext, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";

type ApiResponse = {
  success: boolean;
  message: string;
  status: number;
};

export default function EliminarPerro() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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
      <Button
        type="button"
        className="flex items-center gap-1 w-[141px] h-10 min-w-[80px] rounded-md px-3 py-2 bg-red-600 text-white opacity-100"
        onClick={() => {
          setIsConfirmOpen(true);
        }}
      >
        <Trash2 className="w-4 h-4" />
        Eliminar Perro
      </Button>
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              onClick={() => {
                setIsConfirmOpen(false);
              }}
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="flex flex-col">
              <h2
                className="text-lg font-semibold mb-2 text-gray-800"
                style={{ fontFamily: "Archivo, sans-serif" }}
              >
                ¿Eliminar perro?
              </h2>
              <div className="flex gap-3 w-full justify-between mt-4">
                <Button
                  variant="outline"
                  className="px-6 py-2 rounded-lg font-medium border-gray-300 hover:bg-gray-100 transition text-red-600 sm:h-10"
                  onClick={() => {
                    setIsConfirmOpen(false);
                  }}
                >
                  No, cancelar
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow transition sm:h-10"
                  onClick={() => {
                    setIsConfirmOpen(false);
                    handleDelete().catch(() => {});
                  }}
                >
                  Si, eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
