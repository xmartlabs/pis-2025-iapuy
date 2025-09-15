'use client'
import Image from "next/image";
import Link from "next/link"
import { useRouter } from "next/navigation";
//import { Input } from "@/components/ui/input"
import { useEffect,useState,useContext,useCallback } from "react";
import { LoginContext } from "@/app/context/login-context";
import {jwtDecode} from "jwt-decode";
export enum TipoUsuario{
  Colaborador = "Colaborador",
  Administrador = "Administrador",
}
export interface LoginResponse {
  accessToken: string;
}
export interface JwtPayload {
  nombre: string;
  tipo: TipoUsuario;
}

export default function Home() {
  const context = useContext(LoginContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSuccess = useCallback((data: LoginResponse) => {
    const decoded = jwtDecode<JwtPayload>(data.accessToken);

    context?.setToken(data.accessToken);
    context?.setTipo(decoded.tipo);
    context?.setNombre(decoded.nombre);

    if (decoded.tipo === TipoUsuario.Administrador) {
      router.push("/app/admin/instituciones");
    } else {
      router.push("/app/colaboradores/intervenciones");
    }
  }, [context, router]);
    useEffect(() => {
      const renovarToken = async () => {
        try {
          const res = await fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include", // cookies
          });

          if (res.ok) {
            const data = await res.json() as LoginResponse;
            handleLoginSuccess(data)
          }
        }
        finally{
          setLoading(false);
        }
      };
      renovarToken().catch(() => {
        setLoading(false);
      });
    }, [handleLoginSuccess])   
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);
      const formData = new FormData(e.currentTarget);
      const ci = formData.get("ci") as string;
      const password = formData.get("password") as string;

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ci, password }),
        });
        if (res.ok) {
          const data  = await res.json() as LoginResponse;
          handleLoginSuccess(data)
        }
      } finally {
        setSubmitting(false);
      }
    };
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit(e).catch(console.error);
    };
    if (loading || context?.tokenJwt) {
      return (
        <div/>
      );
    }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#CEE1C6]">
      <main className="w-[564px] h-[729px] !py-6 bg-white rounded-[8px] border border-[#D4D4D4] shadow-[0px_4px_6px_-4px_#0000001A,0px_10px_15px_-3px_#0000001A] ">
        <div className="flex flex-col items-start justify-start !m-[32px] gap-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={150}
            height={150}
          />
          <h1 className="w-[307px] h-[28px] !mt-[32px] font-semibold text-5xl leading-[100%] tracking-[-0.025em] align-middle ">Iniciar Sesión</h1>
          
          <form
             onSubmit={handleFormSubmit}
            className="w-[436px] h-[208px] flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              Cédula de identidad
              <input 
                type="text" 
                name="ci"
                required 
                className="w-full p-2 border rounded mt-1" />
            </label>

            <label className="flex flex-col gap-2">
              Contraseña
              <input 
                type="password" 
                name="password"
                required 
                className="w-full p-2 border rounded mt-1"
                 />
            </label>
            <label className="flex flex-col gap-2">
              Recuperar contraseña
              <input type="text" />
            </label>
            <button 
              type="submit"
              disabled={submitting} 
              className={`w-[436px] h-[40px] min-w-[80px] rounded-md pt-2 pr-3 pb-2 pl-3 bg-[#5B9B40] text-white text-sm font-medium leading-6 tracking-normal hover:bg-[#4F8736] transition-colors flex items-center justify-center gap-[4px]
               ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5B9B40] hover:bg-[#4F8736]'}`}>
              Confirmar
            </button>
            <Link
              href="https://www.iapuy.org/contacto" 
              className="w-[436px] h-[40px] min-w-[80px] rounded-md pt-2 pr-3 pb-2 pl-3 bg-white border border-[#BDD7B3] text-[#5B9B40] text-sm font-medium leading-6 tracking-normal hover:bg-[#EFF5EC] transition-colors flex items-center justify-center gap-[4px]">
              Quiero formar parte
            </Link>
          </form>
        </div>
        
      </main>
    </div>
  );
}
