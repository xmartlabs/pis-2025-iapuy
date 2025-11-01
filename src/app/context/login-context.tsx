"use client";
import { createContext } from "react";
import type { UserType } from "@/app/types/user.types";

export interface Dog {
  id: string;
  nombre: string;
}

export interface LoginContextType {
  tokenJwt: string | null;
  userType: UserType | null;
  userName: string | null;
  userCI: string | null;
  setToken: (tokenJwt: string | null) => void;
  setType: (userType: UserType | null) => void;
  setUserName: (userName: string | null) => void;
  setCI: (userCI: string | null) => void;
  // perros list and helpers so multiple components can share and refresh it
  perros: Dog[];
  setPerros: (perros: Dog[]) => void;
  refreshPerros: () => Promise<void>;
}

export const LoginContext = createContext<LoginContextType | undefined>(
  undefined
);
