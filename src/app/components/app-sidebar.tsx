'use client'
import { Building,Dog,PersonStanding,CalendarRange,BadgeDollarSign} from "lucide-react"
import Image from 'next/image'
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Perros",
    url: "/app/admin/perros",
    icon:Dog,
  },
  {
    title: "Personas",
    url: "/app/admin/personas",
    icon:PersonStanding,
  },
  {
    title: "Instituciones",
    url: "/app/admin/instituciones",
    icon:Building,
  },
  {
    title: "Intervenciones",
    url: "/app/admin/intervenciones",
    icon:CalendarRange,
  },
  {
    title: "Gastos",
    url: "/app/admin/gastos",
    icon:BadgeDollarSign,
  },
]

export function AppSidebar() {
  const pathName=usePathname()
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
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <div className={`w-[228px] h-[40px] flex items-center justify-start ${pathName === item.url ? "bg-[#DEEBD9]" : ""}`}>
                       <Link
                          href={item.url}
                          className="flex items-center gap-2">
                          <item.icon className="mr-2"/>
                          <span className="font-medium text-[14px] leading-5 tracking-normal">{item.title}</span>
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