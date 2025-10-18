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

export interface LoginResponse {
  accessToken: string;
}

export default function Home() {

  const context = useContext(LoginContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    //resolver: zodResolver(FormSchema),
    defaultValues: { ci: "", password: "" },
  });

  const handleLoginSuccess = useCallback(
    (data: LoginResponse) => {

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
    setLoginError("procesando... " + data.password + context?.userName);

    try {
      const token = context?.tokenJwt;

      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({username: context?.userName, password: data.password }),
      });

      if (!res.ok) {
        if (res.status === 607)
          setLoginError("Usuario no existe." + context?.userName);
        else
          setLoginError("Error desconocido. " + res.status + res.error +context?.userName);
        return;
      } else {
        setLoginError("exito");
      }
      

      const response = (await res.json()) as LoginResponse;
      //handleLoginSuccess(response);
    } catch (error){
      console.error(error);
      // ignore network/login errors here; loading flag will be cleared in finally
      setLoginError("error");
    } finally {
      setSubmitting(false);
    }
    setSubmitting(false);
  };

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
          className="max-w-[564px] max-h-[572px] !py-6 bg-white rounded-[8px] border-2 border-[#D4D4D4] 
          justify-between opacity-100 shadow-[0px_4px_6px_-4px_#0000001A,0px_10px_15px_-3px_#0000001A]"
        >
          <div
            className={`w-[436px] flex flex-col items-start justify-start !mx-[64px] ${
              loginError ? "my-[42px]" : "my-[58px]"
            } gap-8`}
          >
            <Image src="/logo.png" alt="Logo" width={150} height={150} />
            <h1 className="h-[96px]  font-semibold text-5xl leading-[100%] tracking-[-0.025em] align-middle">
              Cambiar Contraseña
            </h1>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  form
                    .handleSubmit(handleFormSubmit)(e)
                    .catch(() => {});
                }}
                className="w-[436px] flex flex-col gap-6"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2 relative">
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          className="w-full p-2 border rounded mt-1"
                        />
                      </FormControl>
                      <FormMessage className="absolute -bottom-6" />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className={`w-full h-[40px] rounded-md pt-2 pr-3 pb-2 pl-3 text-white text-sm font-medium leading-6 tracking-normal 
                                flex items-center justify-center gap-1 my-[8px]
                                ${
                                  submitting
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#5B9B40] hover:bg-[#4F8736] transition-colors"
                                }`}
                  >
                    Continuar
                  </Button>
                  {loginError && (
                    <div
                      className="w-[436px] h-[24px] opacity-100 font-sans font-medium 
                                    text-sm leading-6 tracking-[0] text-center text-[var(--destructive,#DC2626)]"
                    >
                      {loginError}
                    </div>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </main>
      )}
      <LoginDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
