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
  const { token, ci, nombre } = searchParams;

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
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="Logo" width={120} height={120} />
        </div>
        <h1 className="text-3xl font-bold text-green-800 text-center mb-6">
          Cambiar contraseña para {nombre}
        </h1>
        <ResetForm ci={ci} token={token} />
      </div>
    </div>
  );
}
