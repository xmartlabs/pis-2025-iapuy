"use client";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { AppSidebar } from "@/app/components/app-sidebar";
import { LoginContext } from "@/app/context/login-context";
import { useContext, useEffect } from "react";
import type { TipoUsuario } from "@/app/page";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
 } from "@/components/ui/dropdown-menu";
type Props = Readonly<{ children: React.ReactNode }>;

export default function LoginLayout({ children }: Props) {
  const context = useContext(LoginContext);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    interface RefreshResponse {
      accessToken: string;
    }

    interface JwtPayload {
      ci: string;
      nombre: string;
      tipo: TipoUsuario;
    }

    const tryRefresh = async (): Promise<void> => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!mounted) return;
        if (res.ok) {
          const data = (await res.json()) as RefreshResponse;
          try {
            const decoded = jwtDecode<JwtPayload>(data.accessToken);
            context?.setToken(data.accessToken);
            context?.setType(decoded.tipo);
            context?.setUserName(decoded.nombre);
            context?.setCI(decoded.ci);
          } catch {
            context?.setToken(null);
            context?.setType(null);
            context?.setUserName(null);
            context?.setCI(null);
            router.replace("/");
          }
        } else {
          context?.setToken(null);
          context?.setType(null);
          context?.setUserName(null);
          context?.setCI(null);
          router.replace("/");
        }
      } catch {
        context?.setToken(null);
        context?.setType(null);
        context?.setUserName(null);
        context?.setCI(null);
        router.replace("/");
      }
    };

    if (!context?.tokenJwt) {
      tryRefresh().catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, [context, router]);

  const userName = context?.userName ?? "";
  const data = userName?.split(" ");
  let iniciales: string = "";
  let nombre: string = "";
  let apellido: string = "";

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      context?.setToken(null);
      context?.setUserName(null);
      context?.setCI(null);

      router.push("/");
      context?.setType(null);
    } catch {
      // ignore logout errors for now
    }
  }

  if (data.length > 1) {
    nombre = data?.[0].charAt(0);
    apellido = data?.[1].charAt(0);
    iniciales = (nombre + apellido).toUpperCase();
  } else if (data.length === 1) {
    nombre = data?.[0].charAt(0);
    iniciales = nombre + nombre;
  } else {
    iniciales = "ZZ";
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger className="block md:hidden" />
        <header className="bg-background flex h-18 border-b border-sidebar-border justify-end !py-3 !pr-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-12 h-12 rounded-full bg-[#DEEBD9] flex items-center justify-center cursor-pointer">
                {iniciales}
              </div>
            </DropdownMenuTrigger>
              <DropdownMenuContent
                side="bottom"
                align="end"
                sideOffset={4}
                className="border !border-[#BDD7B3]"
              >
                <DropdownMenuItem asChild>
                  <Link href={"/app/perfil"}>Mi perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Perfil de [Nombre del perro]</DropdownMenuItem>
                <DropdownMenuSeparator className="!border-[#BDD7B3]" />
                <DropdownMenuItem
                  onClick={() => {
                    handleLogout().catch(() => {});
                  }}
                >
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>          
        </header>
        <main className="!ml-8 !mt-[60px]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
