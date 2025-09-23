"use client";
import { createContext } from "react";
import type { TipoUsuario } from "@/app/api/auth/service/auth.service";
interface LoginContextType {
  tokenJwt: string | null;
  userType: TipoUsuario | null;
  userName: string | null;
  userCI: string | null;
  setToken: (tokenJwt: string | null) => void;
  setType: (userType: TipoUsuario | null) => void;
  setUserName: (userName: string | null) => void;
  setCI: (userCI: string | null) => void;
}

export const LoginContext = createContext<LoginContextType | undefined>(
  undefined
);
