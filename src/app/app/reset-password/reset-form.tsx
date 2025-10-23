"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResetFormProps {
  ci: string;
  token: string;
}

export function ResetForm(props: Readonly<ResetFormProps>) {
  const { token } = props;
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function doSubmit() {
    setIsLoading(true);
    setError(null);

    if (password.length < 8) {
      const msg = "La contraseña debe tener al menos 8 caracteres.";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      const msg = "La contraseña debe contener al menos una letra mayúscula.";
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }

    try {
      const resp = await fetch("/api/magic-link", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (resp.ok) {
        setSuccess(true);
        globalThis.location.href = "/";
        return;
      }

      type ErrorPayload = { error?: string };
      let data: ErrorPayload | null = null;
      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const parsed = (await resp.json()) as unknown;
        if (
          parsed &&
          typeof parsed === "object" &&
          "error" in (parsed as Record<string, unknown>) &&
          typeof (parsed as Record<string, unknown>).error === "string"
        ) {
          data = parsed as ErrorPayload;
        }
      }

      const message = data?.error ?? "Error desconocido";
      setError(message);
      toast.error(message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error de red";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSubmit().catch(() => {});
  };

  if (success) {
    return <p className="text-green-600">Contraseña cambiada correctamente.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md gap-[32px]">
      <div>
        <Label className="font-sans font-normal text-base leading-5 tracking-normal align-middle text-[#1B2F13]">Si te arrepentiste, no pasa nada, solo cerrá la ventana</Label>
      </div>
      <div className="grid w-full items-center gap-[8px]">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          placeholder="••••••••"
          required
          className="w-full h-[40px] rounded-md border border-[#D4D4D4] 
             opacity-100 px-3 py-2.5 text-base font-sans box-border"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" 
              className="w-full h-[40px] min-w-[80px] rounded-md flex items-center justify-center gap-1 
                          opacity-100 px-3 py-2 bg-[#5B9B40] text-white"
              disabled={isLoading}>
        {isLoading ? "Cambiando..." : "Confirmar"}
      </Button>
    </form>
  );
}
