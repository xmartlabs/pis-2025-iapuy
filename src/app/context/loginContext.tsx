'use client'
import { createContext } from "react";
import {TipoUsuario} from "@/app/api/auth/login/route"
interface LoginContextType {
  token_jwt: string | null;
  tipo_usuario:TipoUsuario|null;
  nombre_usuario:string|null;
  setToken: (token_jwt: string | null) => void;
  setTipo: (tipo_usuario:TipoUsuario|null)=>void;
  setNombre: (nombre_usuario: string | null) => void;
}

export const LoginContext = createContext<LoginContextType | undefined>(undefined);