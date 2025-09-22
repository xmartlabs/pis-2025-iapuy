"use client";
import { Pencil, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DetallesPerroDto } from "@/app/api/perros/dtos/detalles-perro.dto";
import { LoginContext } from "@/app/context/login-context";

export function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <h3
        className="text-xs mb-1"
        style={{ fontFamily: "Archivo, sans-serif" }}
      >
        {titulo}
      </h3>
      <p className="" style={{ fontFamily: "Archivo, sans-serif" }}>
        {valor}
      </p>
    </div>
  );
}

const perroDefault = new DetallesPerroDto("", "", "", "", "", "", null);

type ApiResponse = {
  perro: DetallesPerroDto;
  error: string;
  status: number;
};

export default function DetallePerro() {
  const [infoPerro, setInfoPerro] = useState<DetallesPerroDto>(perroDefault);
  const [isOpenError, setIsOpenError] = useState(false);
  const context = useContext(LoginContext);

    const fetchDetallesPerro = useCallback(
        async (id: string): Promise<ApiResponse> => {
            const token = context?.tokenJwt;
            const baseHeaders: Record<string, string> = {
                Accept: "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
            const triedRefresh = false;

            const resp = await fetch(
                `/api/perros/detalles?id=${id}`,
                {
                    method: "GET",
                    headers: baseHeaders,
                },
            );
            if (!resp.ok && !triedRefresh && resp.status === 401) {
                const resp2 = await fetch("/api/auth/refresh", {
                    method: "POST",
                    headers: { Accept: "application/json" },
                });
                if (resp2.ok) {
                    const refreshBody = (await resp2.json().catch(() => null)) as {
                        accessToken?: string;
                    } | null;

                    const newToken = refreshBody?.accessToken ?? null;
                    if (newToken) {
                        context?.setToken(newToken);
                        const retryResp = await fetch(
                            `/api/perros/detalles?id=${id}`,
                            {
                                method: "GET",
                                headers: {
                                    Accept: "application/json",
                                    Authorization: `Bearer ${newToken}`,
                                },
                            },
                        );

                        return (await retryResp.json()) as Promise<
                            Promise<ApiResponse>
                        >;
                    }
                }
            }
            return (await resp.json()) as Promise<ApiResponse>;
        },
        [context],
    );

  const searchParams = useSearchParams();
  const id: string = searchParams.get("id") ?? "";

  useEffect(() => {
      fetchDetallesPerro(id)
      .then((pageResult: ApiResponse) => {
        setInfoPerro(pageResult.perro || perroDefault);
        if (!pageResult.perro) {
          setIsOpenError(true);
        }
      })
      .catch(() => {
        setIsOpenError(true);
      });
  }, [id]);
  return (
    <>
      <div className="w-full">
        <nav className="text-sm text-gray-500 mb-4">
          <ol className="flex items-center space-x-2">
            <li>
              <a
                href="/app/admin/perros"
                className="hover:underline text-green-700"
              >
                Perros
              </a>
            </li>
            <li
              className="text-gray-400"
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              /
            </li>
            <li
              className="font-medium text-gray-700"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {infoPerro.nombre}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1
            className="text-3xl font-serif font-bold text-[#1B2F13]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {infoPerro.nombre}
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-green-700 text-green-700 hover:bg-green-50"
            >
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
            <Button className="flex items-center gap-2 bg-green-700 text-white hover:bg-green-800">
              <HeartPulse className="w-4 h-4" />
              Registrar sanidad
            </Button>
          </div>
        </div>

        <div className="space-y-4 text-[#121F0D]">
          <Dato
            titulo="DUEÑO"
            valor={
                infoPerro.duenioNombre ? (infoPerro.duenioNombre) : ""
            }
          />
          <Dato titulo="DESCRIPCIÓN" valor={infoPerro.descripcion} />
          <Dato titulo="FUERTES" valor={infoPerro.fortalezas} />
        </div>
      </div>

      {isOpenError && (
        <div className="fixed inset-0 bg-gray-500/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>Hubo un problema cargando el Perro</p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/app/admin/perros"
                className="bg-red-400 text-white px-4 py-2 rounded"
              >
                Regresar
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
