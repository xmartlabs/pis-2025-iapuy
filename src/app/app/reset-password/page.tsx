import Image from "next/image";
import { ResetForm } from "./reset-form";

interface PageProps {
  searchParams: {
    token?: string;
    ci?: string;
    nombre?: string;
  };
}

export default function ResetPasswordPage({ searchParams }: PageProps) {
  const { token, ci} = searchParams;

  if (!token || !ci) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#CEE1C6] fixed inset-0"
        style={{
          backgroundImage: "url(/FondoPuntos.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "329px 512px",
          backgroundPosition: "0 0",
        }}
      >
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <p className="text-red-600">
            No se encontro los parametros para esta funcion.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#CEE1C6] fixed inset-0"
      style={{
        backgroundImage: "url(/FondoPuntos.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "329px 512px",
        backgroundPosition: "0 0",
      }}
    >
      <div className="w-[564px] h-[622px] rounded-lg flex flex-col justify-between opacity-100
                      border border-[#D4D4D4] bg-white text-left text-base
                      [box-shadow:0px_4px_6px_-4px_#0000001A,0px_10px_15px_-3px_#0000001A]">

        <div className="w-[436px] h-[502px] flex flex-col gap-[32px] opacity-100 m-[64px]">
          <div className="">
            <Image src="/logo.png" alt="Logo" width={150} height={150} />
          </div>
          <h1 className="font-serif font-semibold text-5xl leading-[100%] tracking-[-0.025em] align-middle
                         text-[#1B2F13]">
            Generar contraseña
          </h1>
          <ResetForm ci={ci} token={token} />
        </div>
      </div>
    </div>
  );
}
