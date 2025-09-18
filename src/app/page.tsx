"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useContext, useCallback } from "react";
import { LoginContext } from "@/app/context/login-context";
import { jwtDecode } from "jwt-decode";
import { LoginDialog } from "@/app/components/login-dialog";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const FormSchema = z.object({
  ci: z
    .string()
    .min(8, { message: "El largo de la cédula no es válido." })
    .max(8, { message: "El largo de la cédula no es válido." }),
  contrasenia: z.string().min(1, { message: "Debe ingresar la contraseña" }),
});
export enum TipoUsuario {
  Colaborador = "Colaborador",
  Administrador = "Administrador",
}
export interface LoginResponse {
  accessToken: string;
}
export interface JwtPayload {
  ci: string;
  nombre: string;
  tipo: TipoUsuario;
}
const LoginDialogTrigger = ({ onOpen }: { onOpen: () => void }) => (
  <button
    type="button"
    onClick={onOpen}
    className="cursor-pointer hover:underline text-left font-medium text-sm leading-6 tracking-normal"
  >
    Recuperar contraseña
  </button>
);
export default function Home() {
  const context = useContext(LoginContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { ci: "", contrasenia: "" },
  });

  const handleLoginSuccess = useCallback(
    (data: LoginResponse) => {
      const decoded = jwtDecode<JwtPayload>(data.accessToken);

      context?.setToken(data.accessToken);
      context?.setTipo(decoded.tipo);
      context?.setNombre(decoded.nombre);
      context?.setCI(decoded.ci);

      if (decoded.tipo === TipoUsuario.Administrador) {
        router.push("/app/admin/instituciones");
      } else {
        router.push("/app/colaboradores/intervenciones");
      }
    },
    [context, router]
  );
  useEffect(() => {
    const renovarToken = async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include", // cookies
        });

        if (res.ok) {
          const data = (await res.json()) as LoginResponse;
          handleLoginSuccess(data);
        }
      } finally {
        setLoading(false);
      }
    };
    renovarToken().catch(() => {
      setLoading(false);
    });
  }, [handleLoginSuccess]);

  const handleFormSubmit = async (data: z.infer<typeof FormSchema>) => {
    setSubmitting(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ci: data.ci, password: data.contrasenia }),
      });

      if (!res.ok) {
        setLoginError("Usuario o contraseña incorrectos");
        return;
      }

      const response = (await res.json()) as LoginResponse;
      handleLoginSuccess(response);
    } catch (error) {
      console.error("Error de red o excepción:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || context?.tokenJwt) {
    return <div />;
  }
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#CEE1C6]"
      style={{
        backgroundImage: "url(/FondoPuntos.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "329px 512px",
        backgroundPosition: "0 0",
      }}
    >
      {!dialogOpen && (
        <main
          className="w-[564px] h-[729px] !py-6 bg-white rounded-[8px] border-2 border-[#D4D4D4] 
          justify-between opacity-100 shadow-[0px_4px_6px_-4px_#0000001A,0px_10px_15px_-3px_#0000001A]"
        >
          <div className="w-[436px] flex flex-col items-start justify-start !mx-[64px] my-[58px] gap-8">
            <Image src="/logo.png" alt="Logo" width={150} height={150} />
            <h1 className="w-[307px] h-[48px]  font-semibold text-5xl leading-[100%] tracking-[-0.025em] align-middle">
              Iniciar Sesión
            </h1>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  form.handleSubmit(handleFormSubmit)(e).catch(console.error);
                }}
                className="w-[436px] flex flex-col gap-6"
              >
                <FormField
                  control={form.control}
                  name="ci"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>Cédula de identidad</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          className="w-full p-2 border rounded mt-1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contrasenia"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          className="w-full p-2 border rounded mt-1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem className="flex flex-col">
                  <LoginDialogTrigger
                    onOpen={() => {
                      setDialogOpen(true);
                    }}
                  />
                  {/*<LoginDialog open={dialogOpen} onOpenChange={setDialogOpen} />*/}
                </FormItem>
                {loginError && (
                  <div className="text-red-600 text-sm mb-2">{loginError}</div>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className={`w-full h-[40px] rounded-md pt-2 pr-3 pb-2 pl-3 text-white text-sm font-medium leading-6 tracking-normal 
                              flex items-center justify-center gap-[4px] my-[8px]
                              ${
                                submitting
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-[#5B9B40] hover:bg-[#4F8736] transition-colors"
                              }`}
                >
                  Confirmar
                </Button>
                <Link
                  href="https://www.iapuy.org/contacto"
                  className="w-full h-[40px] rounded-md pt-2 pr-3 pb-2 pl-3 bg-white border border-[#BDD7B3] 
                            text-[#5B9B40] text-sm font-medium leading-6 tracking-normal 
                            hover:bg-[#EFF5EC] transition-colors flex items-center justify-center gap-[4px]"
                >
                  Quiero formar parte
                </Link>
              </form>
            </Form>
          </div>
        </main>
      )}
      <LoginDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
