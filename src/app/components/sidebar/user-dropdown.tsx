import Link from "next/link";
import { useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
 } from "@/components/ui/dropdown-menu";
 interface props{
    iniciales:string,
    userCI:string,
    handleLogout:()=>void,

 }
export const DropDownMenu = (p:props)=>{
    useEffect(()=>{

    },[])
    return (
        <header className="bg-background flex h-18 border-b border-sidebar-border justify-end !py-3 !pr-8">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="w-12 h-12 rounded-full bg-[#DEEBD9] flex items-center justify-center cursor-pointer">
                        {p.iniciales}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="bottom"
                    align="end"
                    sideOffset={4}
                    className="border !border-[#BDD7B3]"
                    >
                    <DropdownMenuItem asChild>
                        <Link href={"/app/perfil"}>Mi perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Perfil de [Nombre del perro]</DropdownMenuItem>
                    <DropdownMenuSeparator className="!border-[#BDD7B3]" />
                    <DropdownMenuItem onClick={p.handleLogout}>
                        Cerrar sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}