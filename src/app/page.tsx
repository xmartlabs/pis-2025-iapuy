import Image from "next/image";
import { Input } from "@/components/ui/input"
//import styles from "./page.module.css";

export default function Home() {
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
          
          <form className="w-[436px] h-[208px] flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              Cédula de identidad
              <input type="text" name="username" className="w-full p-2 border rounded mt-1" />
            </label>

            <label className="flex flex-col gap-2">
              Contraseña
              <input type="password" name="password" className="w-full p-2 border rounded mt-1" />
            </label>
            <label className="flex flex-col gap-2">
              Recuperar contraseña
            </label>

            <button type="submit" className="w-[436px] h-[40px] min-w-[80px] rounded-md pt-2 pr-3 pb-2 pl-3 bg-[#5B9B40] text-white text-sm font-medium leading-6 tracking-normal hover:bg-[#4F8736] transition-colors flex items-center justify-center gap-[4px]">
              Confirmar
            </button>
            <button className="w-[436px] h-[40px] min-w-[80px] rounded-md pt-2 pr-3 pb-2 pl-3 bg-white border border-[#BDD7B3] text-[#5B9B40] text-sm font-medium leading-6 tracking-normal hover:bg-[#EFF5EC] transition-colors flex items-center justify-center gap-[4px]">
              Quiero formar parte
            </button>
          </form>
        </div>
        
      </main>
    </div>
  );
}
