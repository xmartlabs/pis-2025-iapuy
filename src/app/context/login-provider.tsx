"use client";
import type { ReactNode } from "react";
import { useState, useMemo, useCallback } from "react";
import { LoginContext, type Dog } from "./login-context";
import type { UserType } from "@/app/api/auth/service/auth.service";

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider = ({ children }: LoginProviderProps) => {
  const [tokenJwt, setToken] = useState<string | null>(null);
  const [userType, setType] = useState<UserType | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userCI, setCI] = useState<string | null>(null);
  const [perros, setPerros] = useState<Dog[]>([]);

  const refreshPerros = useCallback(async () => {
    try {
      if (!userCI) return;
      const token = tokenJwt ?? undefined;
      const headers: Record<string, string> = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(`/api/users/${userCI}/perros`, { headers });
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as Dog[] | null;
        if (Array.isArray(data)) setPerros(data);
      }
    } catch {
      // ignore errors here; components can handle missing perros
    }
  }, [userCI, tokenJwt]);

  const value = useMemo(
    () => ({
      tokenJwt,
      setToken,
      userType,
      setType,
      userName,
      setUserName,
      userCI,
      setCI,
      perros,
      setPerros,
      refreshPerros,
    }),
    [tokenJwt, userType, userName, userCI, perros, refreshPerros]
  );

  return (
    <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
  );
};
