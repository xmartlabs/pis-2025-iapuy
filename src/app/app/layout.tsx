import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/components/app-sidebar";
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider >
        
      <AppSidebar />
      <main className="object-fill pt-15 pb-15 pl-8 pr-8 gap-8">
        {children}
      </main>
    </SidebarProvider>
  )
}