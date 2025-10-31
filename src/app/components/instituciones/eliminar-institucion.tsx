
"use client";

import React, { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

export type DeleteInstitutionButtonProps = {
  id: string;
  children?: React.ReactNode;
  className?: string;
};

export default function DeleteInstitutionButton({
  id,
  children = "Eliminar institución",
  className = "",
}: DeleteInstitutionButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const context = useContext(LoginContext)!;
  const router = useRouter();

  async function handleDelete(): Promise<void> {
    try {
      const res = await fetchWithAuth(context, `/api/instituciones?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        toast.success(`Institución eliminada correctamente.`, {
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

        router.push("/app/admin/instituciones/listado");
      } else {
        toast.error(`No se pudo eliminar la Institución.`, {
          duration: 5000,
          icon: null,
          className:
            "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md font-sans font-semibold text-sm leading-5 tracking-normal",
          style: {
            background: "#cfaaaaff",
            border: "1px solid #ec0909ff",
            color: "#ec0909ff",
          },
        });
      }
    } catch {
      toast.error(`No se pudo eliminar la Institución.`, {
        duration: 5000,
        icon: null,
        className:
          "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md font-sans font-semibold text-sm leading-5 tracking-normal",
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
        onClick={() => {
          setIsConfirmOpen(true);
        }}
        className={`w-[172px] h-[40px] bg-red-600 hover:bg-red-700 text-white rounded-lg px-6 py-3 shadow-sm flex items-center gap-3 ${className}`}
        aria-label="Eliminar institución"
      >
        <span className="w-8 h-8 flex items-center justify-center rounded-md">
          <Trash2 className="w-4 h-4 text-white" />
        </span>

        <span className="text-sm font-medium">{children}</span>
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
                ¿Eliminar Institución?
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
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={async () => {
                    setIsConfirmOpen(false);
                    await handleDelete();
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
