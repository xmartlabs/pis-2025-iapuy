/* eslint-disable @typescript-eslint/consistent-return */
"use client";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/components/sidebar/app-sidebar";
import { usePathname } from 'next/navigation';
import {DropDownMenu} from "@/app/components/sidebar/user-dropdown";
import { LoginContext } from "@/app/context/login-context";
import { useContext, useEffect } from "react";
import type { UserType } from "@/app/page";
import { usePathname, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

type Props = Readonly<{ children: React.ReactNode }>;

export default function LoginLayout({ children }: Props) {
  const context = useContext(LoginContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/app/reset-password") {
      return;
    }
    let mounted = true;
    interface RefreshResponse {
      accessToken: string;
    }

    interface JwtPayload {
      ci: string;
      name: string;
      type: UserType;
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
            context?.setType(decoded.type);
            context?.setUserName(decoded.name);
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
  let name: string = "";
  let lastName: string = "";

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
    } catch {
      // ignore logout errors for now
    }
  }

  if (data.length > 1) {
    name = data?.[0].charAt(0);
    lastName = data?.[1].charAt(0);
    iniciales = (name + lastName).toUpperCase();
  } else if (data.length === 1) {
    name = data?.[0].charAt(0);
    iniciales = name + name;
  } else {
    iniciales = "ZZ";
  }

  const pathname = usePathname();


  const noSidebarRoutes = ['/app/perfil/change-password']; // routes where sidebar is not shown

  const shouldShowSidebar = !noSidebarRoutes.includes(pathname);

  return (
    <SidebarProvider>
      {shouldShowSidebar && <AppSidebar />}
      <SidebarInset>
        {shouldShowSidebar && <SidebarTrigger className="block md:hidden" />}
        {/* eslint-disable-next-line no-void*/}
        {shouldShowSidebar && <DropDownMenu iniciales={iniciales} handleLogout={() => void handleLogout()}/>}
        <main className={shouldShowSidebar ? "!ml-8 !mt-[60px]" : ""}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );

}
