import Link from "next/link";
import { UserType } from "@/app/types/user.types";
import { useEffect, useContext } from "react";
import { LoginContext } from "@/app/context/login-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface props {
  iniciales: string;
  handleLogout: () => void;
}

export const DropDownMenu = (p: props) => {
  const context = useContext(LoginContext);
  let urlDogs = "";

  const dogs = context?.perros ?? [];
  useEffect(() => {
    context?.refreshPerros?.().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.userCI]);

  if (!context?.userType) {
    return null;
  }
  const type: UserType = context?.userType;
  if (type === UserType.Administrator) {
    urlDogs = "/app/admin/perros/detalles";
  } else {
    urlDogs = "/app/colaboradores/perros/detalles";
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
};
