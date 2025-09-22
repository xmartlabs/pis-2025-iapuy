"use client";
import { CircleAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContext, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoginContext } from "@/app/context/login-context";

type ApiResponse = {
  success: boolean;
  message: string;
  status: number;
};

export default function EliminarPerro() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [result, setResult] = useState(false);
  const searchParams = useSearchParams();
  const id: string = searchParams.get("id") ?? "";

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

      if (res.ok) {
        const data = (await res.json().catch(() => null)) as ApiResponse | null;
        setResult(Boolean(data?.success ?? true));
        setIsResultOpen(true);
      } else {
        setResult(false);
        setIsResultOpen(true);
      }
    } catch {
      setResult(false);
      setIsResultOpen(true);
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
            <div className="flex flex-col items-center">
              <Trash2 className="w-10 h-10 text-red-500 mb-2" />
              <h2 className="text-2xl font-semibold mb-2 text-gray-800 text-center">
                ¿Seguro que desea eliminar al perro?
              </h2>
              <p className="text-gray-500 mb-6 text-center">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 w-full justify-center">
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow transition"
                  onClick={() => {
                    setIsConfirmOpen(false);
                    handleDelete().catch(() => {});
                  }}
                >
                  Confirmar
                </Button>
                <Button
                  variant="outline"
                  className="px-6 py-2 rounded-lg font-medium border-gray-300 hover:bg-gray-100 transition"
                  onClick={() => {
                    setIsConfirmOpen(false);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isResultOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              onClick={() => {
                setIsResultOpen(false);
              }}
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="flex flex-col items-center">
              {result ? (
                <>
                  <Trash2 className="w-10 h-10 text-green-500 mb-2" />
                  <h2 className="text-2xl font-semibold mb-2 text-gray-800 text-center">
                    Perro eliminado correctamente
                  </h2>
                  <div className="mt-6 flex justify-center w-full">
                    <Link
                      href="/app/admin/perros"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow transition text-center"
                    >
                      Ok
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <CircleAlert className="w-10 h-10 text-red-500 mb-2" />
                  <h2 className="text-2xl font-semibold mb-2 text-gray-800 text-center">
                    Error: Por favor vuelva a intentarlo
                  </h2>
                  <div className="mt-6 flex justify-center w-full">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow transition text-center"
                      onClick={() => {
                        setIsResultOpen(false);
                      }}
                    >
                      Ok
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
