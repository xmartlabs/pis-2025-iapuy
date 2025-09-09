import { SidebarProvider, SidebarTrigger,SidebarInset } from "@/components/ui/sidebar";
import Link from "next/link";
import { AppSidebar } from "@/app/components/app-sidebar"
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider >
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger className="block md:hidden"/>
        <header className="bg-background flex h-18 border-b border-sidebar-border justify-end !py-3 !pr-8">
          
          <Link href="/app/perfil/">
            <div className="w-12 h-12 rounded-full bg-[#DEEBD9] flex items-center justify-center cursor-pointer">
              <span className="font-normal text-lg leading-[100%] tracking-normal text-center align-middle">BS</span>
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