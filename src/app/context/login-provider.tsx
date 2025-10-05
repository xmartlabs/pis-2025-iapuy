"use client";
import type { ReactNode } from "react";
import { useState, useMemo } from "react";
import { LoginContext } from "./login-context";
import type { UserType } from "@/app/api/auth/service/auth.service";

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider = ({ children }: LoginProviderProps) => {
  const [tokenJwt, setToken] = useState<string | null>(null);
  const [userType, setType] = useState<UserType | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userCI, setCI] = useState<string | null>(null);

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
    }),
    [tokenJwt, userType, userName, userCI]
  );

  return (
    <LoginContext.Provider value={value}>{children}</LoginContext.Provider>
  );
};
