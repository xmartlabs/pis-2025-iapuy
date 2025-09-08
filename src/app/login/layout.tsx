import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/components/app-sidebar";
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider >
        
      <AppSidebar />
      <main style={{marginLeft:'32px'}}>
        {children}
      </main>
    </SidebarProvider>
  )
}