"use client";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { AppSidebar } from "@/app/components/app-sidebar";
import { LoginContext } from "@/app/context/login-context";
import { useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

export default function ConditionalSidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname() || "";
  const context = useContext(LoginContext);
  const router = useRouter();

  if (pathname === "/") return <>{children}</>;

  const UserName = context?.userName ?? "";
  const data = UserName ? UserName.split(" ") : [];

  let initials = "ZZ";
  if (data && data.length > 1) {
    const nombre = data[0]?.charAt(0) ?? "";
    const lastName = data[1]?.charAt(0) ?? "";
    initials = (nombre + lastName).toUpperCase();
  } else if (data && data.length === 1) {
    const nombre = data[0]?.charAt(0) ?? "";
    initials = (nombre + nombre).toUpperCase();
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      context?.setToken(null);
      context?.setUserName(null);
      context?.setCI(null);
      context?.setType(null);
      router.push("/");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn("Logout failed:", error);
      }
    }
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
                {initials}
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
