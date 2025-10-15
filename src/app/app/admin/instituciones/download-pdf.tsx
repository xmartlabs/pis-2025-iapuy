import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import React, { useContext, useState } from "react";
import { LoginContext } from "@/app/context/login-context";
import { Printer, Loader2 } from "lucide-react";

interface LoginContextType {
  tokenJwt?: string | null;
  setToken?: (token: string) => void;
}

async function downloadLogic(
  id: string,
  dates: Date[],
  context: LoginContextType
): Promise<Response> {
  const res = await fetch(`/api/instituciones/${id}/pdf-interventions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${context?.tokenJwt}`,
    },
    body: JSON.stringify({
      dates: dates.map((date) => date.toISOString()),
    }),
  });

  if (!res.ok) {
    toast.error("Ocurrio un error inesperado", {
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

  return res;
}

async function handleDownload(
  params: { id: string; dates: Date[] },
  context: LoginContextType,
  signal?: AbortSignal,
  triedRefresh = false
): Promise<Uint8Array | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);
  const combinedSignal = signal ?? controller.signal;

  try {
    const token = context?.tokenJwt;

    if (!token) {
      throw new Error("No authentication token available");
    }

    const resp = await downloadLogic(params.id, params.dates, context);

    if (!resp.ok && !triedRefresh && resp.status === 401) {
      const resp2 = await fetch(new URL("/api/auth/refresh", location.origin), {
        method: "POST",
        headers: { Accept: "application/json" },
        signal: combinedSignal,
      });

      if (resp2.ok) {
        const refreshBody = (await resp2.json().catch(() => null)) as {
          accessToken?: string;
        } | null;

        const newToken = refreshBody?.accessToken ?? null;
        if (newToken && context.setToken) {
          context.setToken(newToken);
          return await handleDownload(params, context, signal, true);
        }
      }
    }

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(
        `API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`
      );
    }

    const arrayBuffer = await resp.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const blob = new Blob([uint8Array], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `instituciones-${params.id}-interventions.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("PDF descargado exitosamente", {
      duration: 3000,
    });

    return uint8Array;
  } catch (err) {
    if ((err as DOMException)?.name === "AbortError") {
      return null;
    }
    toast.error("Error al descargar el PDF", {
      duration: 5000,
    });
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

interface DownloadButtonProps {
  id: string;
  dates: Date[];
}

export function DownloadButton({ id, dates }: DownloadButtonProps) {
  const context = useContext(LoginContext);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClick = () => {
    if (!context) {
      toast.error("No se pudo obtener el contexto de autenticación");
      return;
    }

    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    handleDownload({ id, dates }, context)
      .catch(() => {})
      .finally(() => {
        setIsDownloading(false);
      });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isDownloading}
      className="rounded-lg border-2 border-[var(--custom-green)] bg-white p-2 hover:bg-[var(--custom-green)] hover:text-white flex items-center gap-2 text-[var(--custom-green)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[var(--custom-green)]"
    >
      {isDownloading ? (
        <Loader2 className="h-5 w-5 text-[var(--custom-green)] animate-spin" />
      ) : (
        <Printer className="h-5 w-5 text-[var(--custom-green)]" />
      )}
      {isDownloading ? "Descargando..." : "Imprimir historial"}
    </Button>
  );
}
