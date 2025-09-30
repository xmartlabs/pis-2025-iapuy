"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginContext } from "@/app/context/login-context";
import {TipoUsuario} from "@/app/page"
interface Props {
  children: React.ReactNode;
}
export default function AdminLayout({ children }: Props) {
    const router = useRouter();
    const context = useContext(LoginContext);
    const userType:TipoUsuario |null=context?.userType ??null;
    useEffect(() => {
        
        if (userType === TipoUsuario.Colaborador) {
        router.push("/");
        }
    }, [userType, router]);
    if (userType === null) return null;
    return <>{children}</>;
}