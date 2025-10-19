"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResetFormProps {
  ci: string;
  token: string;
}

export function ResetForm({ ci, token }: ResetFormProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log(ci, token);

    // try {
    //   const resp = await fetch("/api/reset-password", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ userId, token, newPassword: password }),
    //   });
    //   const data = await resp.json();
    //   if (!resp.ok) {
    //     throw new Error(data?.error || "Error desconocido");
    //   }
    //   setSuccess(true);
    // } catch (err: any) {
    //   setError(err.message);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  if (success) {
    return <p className="text-green-600">Contraseña cambiada correctamente.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          placeholder="••••••••"
          required
          className="w-full"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Cambiando..." : "Confirmar"}
      </Button>
    </form>
  );
}
