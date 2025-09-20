"use client";
import { createContext } from "react";
import type { TipoUsuario } from "@/app/api/auth/controller/auth.controller";
export interface LoginContextType {
  tokenJwt: string | null;
  tipoUsuario: TipoUsuario | null;
  nombreUsuario: string | null;
  ciUsuario: string | null;
  setToken: (tokenJwt: string | null) => void;
  setTipo: (tipoUsuario: TipoUsuario | null) => void;
  setNombre: (nombreUsuario: string | null) => void;
  setCI: (ciUsuario: string | null) => void;
}

export const LoginContext = createContext<LoginContextType | undefined>(
  undefined
);
