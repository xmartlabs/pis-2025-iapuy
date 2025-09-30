import Link from "next/link";
import {TipoUsuario} from "@/app/page"
import { useState,useEffect,useContext } from "react";
import { LoginContext } from "@/app/context/login-context";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
 } from "@/components/ui/dropdown-menu";
 interface Dog {
  id: string;
  nombre: string;
}
 interface props{
    iniciales:string,
    handleLogout:()=>void,

 }

export const DropDownMenu = (p:props)=>{
    const [dogs, setdogs] = useState<Dog[]>([]);
    const context = useContext(LoginContext);
    const token=context?.tokenJwt
    let urlDogs='';
    useEffect(() => {
      const getDogs = async () => {
        try {
          const res = await fetch(`/api/users/${context?.userCI}/perros`, {
            method: "GET",
            headers:{
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          });

          if (res.ok) {
            const data = (await res.json()) as Dog[];
            setdogs(data);
          
          }
        } catch{
          // ignore errors for now
        }
      };
    getDogs().catch(() => {});
  }, [context,token]);
    if (!context?.userType) {
      return null;
    }
    const type:TipoUsuario=context?.userType;
    if (type===TipoUsuario.Administrador){
      urlDogs='/app/admin/perros/detalles';
    }else{
      urlDogs='/app/colaboradores/perros/detalles';
    }
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
                    {/*<DropdownMenuItem>Perfil de [Nombre del perro]</DropdownMenuItem>*/}
                    {dogs.map((d) => (
                        <DropdownMenuItem key={d.id} asChild>
                            <Link href={`${urlDogs}?id=${d.id}`}>Perfil de {d.nombre}</Link>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="!border-[#BDD7B3]" />
                    <DropdownMenuItem onClick={p.handleLogout}>
                        Cerrar sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}