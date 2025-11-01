"use client";
import { useContext, useEffect } from "react";
import { LoginContext } from "@/app/context/login-context";
import {UserType} from "@/app/types/user.types"
import { forbidden } from 'next/navigation'
interface Props {
  children: React.ReactNode;
}
export default function AdminLayout({ children }: Props) {
    const context = useContext(LoginContext);
    const userType:UserType |null=context?.userType ??null;
    useEffect(() => {
        
        if (userType === UserType.Administrator) {
          forbidden(); 
        }
    }, [userType]);
    if (userType === null) return null;
    return <>{children}</>;
}