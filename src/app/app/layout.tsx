'use client'
import { SidebarProvider, SidebarTrigger,SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { AppSidebar } from "@/app/components/app-sidebar"
import { LoginContext } from "@/app/context/login-context";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const context = useContext(LoginContext);
  const nombreUsuario = context?.nombreUsuario ?? '';
  const data=nombreUsuario?.split(' ')
  const router = useRouter();
  let iniciales: string =''
  let nombre:string =''
  let apellido:string =''

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Limpiar contexto
      context?.setToken(null);
      context?.setNombre(null);
      context?.setCI(null);

      // Redirigir al login
      router.push("/");
      context?.setTipo(null);
    } catch (err) {
      console.error("Error al cerrar sesión", err);
      // Podés mostrar un mensaje al usuario si querés
    }
  }

  if (data.length>1){
    nombre=data?.[0].charAt(0);
    apellido=data?.[1].charAt(0);
    iniciales = (nombre + apellido).toUpperCase();
  }else if(data.length===1){
    nombre=data?.[0].charAt(0);
    iniciales = nombre+nombre
  }
  else{
    iniciales='ZZ'
  }
  
  return (
    <SidebarProvider >
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger className="block md:hidden"/>
        <header className="bg-background flex h-18 border-b border-sidebar-border justify-end !py-3 !pr-8">        
              <ContextMenu>
                <ContextMenuTrigger>
                  <div className="w-12 h-12 rounded-full bg-[#DEEBD9] flex items-center justify-center cursor-pointer">
                    {iniciales}
                  </div>  
                </ContextMenuTrigger>
                <ContextMenuContent className="border !border-[#BDD7B3]" 
                  alignOffset={4}>
                  <ContextMenuItem asChild>
                    <Link href={"/app/perfil"}>Mi perfil</Link>
                  </ContextMenuItem>
                  <ContextMenuItem>Perfil de [Nombre del perro]</ContextMenuItem>
                  <ContextMenuSeparator className="!border-[#BDD7B3]"/>
                  <ContextMenuItem onClick={() => {handleLogout().catch(err => {console.error("Error al cerrar sesión:", err);});}}>
                    Cerrar sesión
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
        </header>
        
        <main className="!ml-8 !mt-[60px]">
          
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
