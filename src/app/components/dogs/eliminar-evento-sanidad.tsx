"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";
import ConfirmDelete from "../confirm-delete";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

type Props = {
  id: string;
  activity: string;
  disabled: boolean;
};
export default function EliminarEventoSanidad({
  id,
  activity,
  disabled,
}: Props) {
  const context = useContext(LoginContext)!;

  async function handleDelete(): Promise<void> {
    try {
      const res = await fetchWithAuth(
        context,
        `/api/registros-sanidad?id=${encodeURIComponent(id)}&activity=${encodeURIComponent(activity)}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
        }
      );

      if (res.ok) {
        toast.success(
          `${activity} ${activity === "Baño" ? "eliminado" : "eliminada"} correctamente.`,
          {
            duration: 5000,
            icon: null,
            className:
              "w-full max-w-[388px] h-[68px] pl-6 pb-6 pt-6 pr-8 rounded-md font-sans font-semibold text-sm leading-5 tracking-normal",
            style: {
              background: "#DEEBD9",
              border: "1px solid #BDD7B3",
              color: "#121F0D",
            },
          }
        );

        window.location.reload();
      } else {
        toast.error(`No se pudo eliminar ${activity}.`, {
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
      toast.error(`No se pudo eliminar ${activity}.`, {
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
      <ConfirmDelete
        handleAction={handleDelete}
        title={`¿Eliminar ${activity}?`}
      >
        {(open) => (
          <div
            title={disabled ? "No se puede eliminar porque ya se pagó" : ""}
            className="text-green-500 hover:text-green-700"
          >
            <Button
              type="button"
              disabled={disabled}
              className={`shrink-0 p-1 ${
                disabled
                  ? "disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-100"
                  : ""
              }`}
              onClick={open}
            >
              <Trash2 />
            </Button>
          </div>
        )}
      </ConfirmDelete>
    </>
  );
}
