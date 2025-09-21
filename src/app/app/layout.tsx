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
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
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
            context?.setTipo(decoded.tipo);
            context?.setNombre(decoded.nombre);
            context?.setCI(decoded.ci);
          } catch {
            context?.setToken(null);
            context?.setTipo(null);
            context?.setNombre(null);
            context?.setCI(null);
            router.replace("/");
          }
        } else {
          context?.setToken(null);
          context?.setTipo(null);
          context?.setNombre(null);
          context?.setCI(null);
          router.replace("/");
        }
      } catch {
        context?.setToken(null);
        context?.setTipo(null);
        context?.setNombre(null);
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

  const nombreUsuario = context?.nombreUsuario ?? "";
  const data = nombreUsuario?.split(" ");
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
      context?.setNombre(null);
      context?.setCI(null);

      router.push("/");
      context?.setTipo(null);
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
          <ContextMenu>
            <ContextMenuTrigger>
              <div className="w-12 h-12 rounded-full bg-[#DEEBD9] flex items-center justify-center cursor-pointer">
                {iniciales}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent
              className="border !border-[#BDD7B3]"
              alignOffset={4}
            >
              <ContextMenuItem asChild>
                <Link href={"/app/perfil"}>Mi perfil</Link>
              </ContextMenuItem>
              <ContextMenuItem>Perfil de [Nombre del perro]</ContextMenuItem>
              <ContextMenuSeparator className="!border-[#BDD7B3]" />
              <ContextMenuItem
                onClick={() => {
                  handleLogout().catch(() => {});
                }}
              >
                Cerrar sesión
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </header>

        <main className="!ml-8 !mt-[60px]">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
