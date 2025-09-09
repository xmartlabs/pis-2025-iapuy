'use client'
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import Image from 'next/image'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { inter } from "@/fonts";
import {
  Sidebar,
  SidebarContent,
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
  },
  {
    title: "Personas",
    url: "/app/admin/personas",
  },
  {
    title: "Instituciones",
    url: "/app/admin/instituciones",
  },
  {
    title: "Intervenciones",
    url: "/app/admin/intervenciones",
  },
  {
    title: "Gastos",
    url: "/app/admin/gastos",
  },
]

export function AppSidebar() {
  const pathName=usePathname()
  return (
    <Sidebar className="w-[260px]">
      <div className="w-[258px] h-[133px]">
          <Image
            src="/logo.png"
            alt="Logo"
            width={53}
            height={53}
          style={{marginLeft:'24px',marginTop:'40px'}}
          />
        </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className={`${inter.className} antialiased`}>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <div className={`w-[258px] h-[48px] flex items-center justify-center ${pathName === item.url ? "bg-[#E2E7F0]" : ""}`}>
                       <Link
                          href={item.url}
                          className="w-[210px] h-[24px] flex items-center justify-center">
                          <span className="font-medium text-[14px] leading-[24px] tracking-[-0.01em]">{item.title}</span>
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