"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useContext} from "react";
import { LoginContext } from "@/app/context/login-context";
import { LoginDialog } from "@/app/components/login-dialog";
import { Input } from "@/components/ui/input";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";

const FormSchema = z.object({
  password: z.string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
    .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula." }),
});

export interface PasswordChangeResponse {
  accessToken: string;
}

export default function Home() {

  const context = useContext(LoginContext)!;
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [reponseError, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { password: "" },
  });

  const handleFormSubmit = async (data: z.infer<typeof FormSchema>) => {
    setSubmitting(true);
    setError(null);

    let newPassword: string = "";

    try {
      newPassword = data.password;

      if (newPassword.length < 8 || !/[A-Z]/.test(newPassword)) {
          setError("La contraseña debe tener al menos 8 caracteres, y al menos una mayúscula.");
          return;
      }

      const res = await fetchWithAuth(context, "/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: context?.userCI,
          password: newPassword,
        }),
      });

      if (!res.ok) {
        if (res.status === 404)
          setError(`Usuario no existe. ${context?.userCI} ${context?.userName}`);
        else
          setError(`Error desconocido. ${res.status}`);
        return;
      }
      router.push(`/app/perfil?passwordChanged=true`);
    } catch {
      setError(`error al cambiar la contraseña.`);
    } finally {
      setSubmitting(false);
    }
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
              reponseError ? "my-[42px]" : "my-[58px]"
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
                  {reponseError && (
                    <div
                      className="w-[436px] h-[24px] opacity-100 font-sans font-medium 
                                    text-sm leading-6 tracking-[0] text-center text-[var(--destructive,#DC2626)]"
                    >
                      {reponseError}
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
