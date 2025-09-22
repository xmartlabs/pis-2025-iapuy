"use client";
import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { LoginContext } from "./login-context";
import type { TipoUsuario } from "@/app/api/auth/service/auth.service";

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider = ({ children }: LoginProviderProps) => {
  const [tokenJwt, setToken] = useState<string | null>(null);
  const [tipoUsuario, setTipo] = useState<TipoUsuario | null>(null);
  const [nombreUsuario, setNombre] = useState<string | null>(null);
  const [ciUsuario, setCI] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      tokenJwt,
      setToken,
      tipoUsuario,
      setTipo,
      nombreUsuario,
      setNombre,
      ciUsuario,
      setCI,
    }),
    [tokenJwt, tipoUsuario, nombreUsuario, ciUsuario]
  );

  return (
    <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
  );
};
