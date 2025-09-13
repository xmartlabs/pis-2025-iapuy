'use client'
import { SidebarProvider, SidebarTrigger,SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { AppSidebar } from "@/app/components/app-sidebar"
import { LoginContext } from "@/app/context/loginContext";
import { useContext } from "react";
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const context = useContext(LoginContext);
  const nombre_usuario = context?.nombre_usuario ?? '';
  console.log(nombre_usuario)
  const data=nombre_usuario?.split(' ')
  let iniciales: string
  let nombre:string
  let apellido:string
  if (data.length>1){
    nombre=data?.[0].charAt(0);
    apellido=data?.[1].charAt(0);
    iniciales = (nombre + apellido).toUpperCase();
  }else if(data.length==1){
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
          
          <Link href="/app/perfil/">
            <div className="w-12 h-12 rounded-full bg-[#DEEBD9] flex items-center justify-center cursor-pointer">
              <span className="font-normal text-lg leading-[100%] tracking-normal text-center align-middle">{iniciales}</span>
            </div>
          </Link>
        </header>
        
        <main className="!ml-8 !mt-[60px]">
          
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}