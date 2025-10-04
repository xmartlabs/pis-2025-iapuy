"use client";

import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react"; // icon library
import { LoginContext } from "@/app/context/login-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EliminarUsuarioProps {
  ci: string;
}

export const BotonEliminarUsuario: React.FC<EliminarUsuarioProps> = ({
  // eslint-disable-next-line react/prop-types
  ci,
}) => {
  const context = useContext(LoginContext);
  const router = useRouter();

  const deleteUser = async (ciu: string): Promise<void> => {
    const baseHeaders: Record<string, string> = {
      Accept: "application/json",
      ...(context?.tokenJwt
        ? { Authorization: `Bearer ${context.tokenJwt}` }
        : {}),
    };

    const resp = await fetch(`/api/users?ci=${ciu}`, {
      method: "DELETE",
      headers: baseHeaders,
    });

    if (resp.ok) {
      toast.success(`¡ Usuario eliminado con exito !`, {
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

      router.push("/app/admin/personas/listado");
      return;
    }
    const throwApiError = async (r: Response, prefix = "API") => {
      const txt = await r.text().catch(() => "");
      const suffix = txt ? ` - ${txt}` : "";
      throw new Error(`${prefix} ${r.status}: ${r.statusText}${suffix}`);
    };

    // If 401, try refreshing token once and retry
    if (resp.status === 401) {
      const refreshResp = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      if (refreshResp.ok) {
        const refreshBody = (await refreshResp.json().catch(() => null)) as {
          accessToken?: string;
        } | null;
        const newToken = refreshBody?.accessToken ?? null;
        if (newToken) {
          context?.setToken(newToken);

          const retryResp = await fetch(`/api/users?ci=${ciu}`, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${newToken}`,
            },
          });

          if (retryResp.ok) {
            toast.success(`¡ Usuario eliminado con exito !`, {
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
            router.push("/app/admin/personas/listado");
            return;
          }
          await throwApiError(retryResp);
        }
      }

      // Refresh failed or didn't return a token
      const txt = await refreshResp.text().catch(() => "");
      const suffix = txt ? ` - ${txt}` : "";
      throw new Error(
        `Refresh failed: ${refreshResp.status} ${refreshResp.statusText}${suffix}`
      );
    }

    // Non-401 failure on first attempt
    await throwApiError(resp);
  };

  return (
    <Button
      onClick={() => {
        deleteUser(ci).catch((e) => {
          toast.error(`No se pudo eliminar al usuario, intentelo de nuevo.`, {
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
          throw e;
        });
      }}
      className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2 px-6 py-3 w-[159px] h-[40px]"
    >
      <Trash2 className="w-5 h-5" />
      <span>Eliminar persona</span>
    </Button>
  );
};
