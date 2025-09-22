'use client'
import { Building,Dog,PersonStanding,CalendarRange,BadgeDollarSign} from "lucide-react"
import Image from 'next/image'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { LoginContext } from "@/app/context/login-context";
import {TipoUsuario} from "@/app/page"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathName=usePathname()
  const context = useContext(LoginContext);
  if (!context?.tipoUsuario) {
    return null;
  }
  const tipo:TipoUsuario=context?.tipoUsuario;
  const items = [
  {
    title: "Perros",
    url: "/app/admin/perros/listado",
    icon:Dog,
    onlyAdmin:true,
  },
  {
    title: "Personas",
    url: "/app/admin/personas/listado",
    icon:PersonStanding,
    onlyAdmin:true,
  },
  {
    title: "Instituciones",
    url: "/app/admin/instituciones/listado",
    icon:Building,
    onlyAdmin:true,
  },
  {
    title: "Intervenciones",
    url: tipo === TipoUsuario.Administrador ? "/app/admin/intervenciones":"/app/colaboradores/intervenciones/listado",
    icon:CalendarRange,
    onlyAdmin:false
  },
  {
    title: "Gastos",
    url: tipo === TipoUsuario.Administrador ?"/app/admin/gastos":"/app/colaboradores/gastos/listado",
    icon:BadgeDollarSign,
    onlyAdmin:false
  },
]
  return (
    <Sidebar>
      <SidebarHeader className=" h-[261px]">
        <div className="w-[258px] h-[133px]">
            <Image
              src="/logo.png"
              alt="Logo"
              width={150}
              height={150}
            style={{marginLeft:'16px',marginTop:'48px'}}
            />
        </div>
      </SidebarHeader>
      <SidebarContent className="!px-4" >
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.filter(item => {
                  if (tipo === TipoUsuario.Administrador) return true; 
                  return item.onlyAdmin === false; 
                })
                .map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <div
                        className={`w-[228px] h-[40px] flex items-center justify-start ${
                          pathName === item.url ? "bg-[#DEEBD9]" : ""
                        }`}
                      >
                        <Link href={item.url} className="flex items-center gap-2">
                          <item.icon className="mr-2" />
                          <span className="font-medium text-[14px] leading-5 tracking-normal">
                            {item.title}
                          </span>
                        </Link>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}