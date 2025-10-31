import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import React, { useContext, useState } from "react";
import type{ LoginContextType } from "@/app/context/login-context";
import {LoginContext} from "@/app/context/login-context";
import { Printer, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

async function handleDownload(
  params: { id: string; dates: Date[] },
  context: LoginContextType,
  signal?: AbortSignal
): Promise<Uint8Array | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);
  const combinedSignal = signal ?? controller.signal;

  try {
    const body = JSON.stringify({
      dates: params.dates.map((date) => date.toISOString()),
    });

    const resp = await fetchWithAuth(
      context,
      `/api/instituciones/${params.id}/pdf-interventions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf",
        },
        body,
        signal: combinedSignal,
      }
    );

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

    return null;
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
      className="w-[158px] h-[40px] min-w-[80px] px-3 py-2 gap-1 
                  rounded-md border border-[#BDD7B3] 
                  bg-white flex items-center justify-center text-[#5B9B40]"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 text-[var(--custom-green)] animate-spin" />
      ) : (
        <Printer className="h-4 w-4 text-[var(--custom-green)]" />
      )}
      {isDownloading ? "Descargando..." : "Imprimir historial"}
    </Button>
  );
}
