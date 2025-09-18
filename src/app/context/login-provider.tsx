"use client";
import type { ReactNode } from "react";
import { useState } from "react";
import { LoginContext } from "./login-context";
import type { TipoUsuario } from "@/app/api/auth/login/route";

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider = ({ children }: LoginProviderProps) => {
  const [tokenJwt, setToken] = useState<string | null>(null);
  const [tipoUsuario, setTipo] = useState<TipoUsuario | null>(null);
  const [nombreUsuario, setNombre] = useState<string | null>(null);
  const [ciUsuario, setCI] = useState<string | null>(null);
  return (
    <LoginContext.Provider
      value={{
        tokenJwt,
        setToken,
        tipoUsuario,
        setTipo,
        nombreUsuario,
        setNombre,
        ciUsuario,
        setCI,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
