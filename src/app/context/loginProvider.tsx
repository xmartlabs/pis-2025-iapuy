'use client'
import { useState, ReactNode } from "react";
import {LoginContext} from "./loginContext"
import { TipoUsuario } from "@/app/api/auth/login/route";

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider = ({ children }: LoginProviderProps) => {
  const [token_jwt, setToken] = useState<string | null>(null);
  const [tipo_usuario, setTipo] = useState<TipoUsuario  | null>(null);
  const [nombre_usuario,setNombre]=useState<string | null>(null);
  return (
    <LoginContext.Provider value={{ token_jwt, setToken,tipo_usuario, setTipo,nombre_usuario,setNombre }}>
      {children}
    </LoginContext.Provider>
  );
};