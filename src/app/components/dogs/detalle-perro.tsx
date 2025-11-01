"use client";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DetallesPerroDto } from "@/app/api/perros/dtos/detalles-perro.dto";
import { LoginContext } from "@/app/context/login-context";
import RegistroSanidad from "../../app/admin/perros/registrar-sanidad";
import CustomBreadCrumb from "@/app/components/bread-crumb/bread-crumb";
import { UserType } from "@/app/page";
import { forbidden } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/fetch-with-auth";
function Dato({ titulo, valor }: { titulo: string; valor: string }) {
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
  const context = useContext(LoginContext)!;
  const fetchDetallesPerro = useCallback(
    async (id: string): Promise<ApiResponse> => {
      const resp = await fetchWithAuth(
        context,
        `/api/perros/detalles?id=${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      return (await resp.json()) as ApiResponse;
    },
    [context]
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
  }, [fetchDetallesPerro, id]);
  if (!context?.userType) {
    return null;
  }
  const userType: UserType = context?.userType;
  return (
    <>
      <div className="w-full">
        {userType === UserType.Administrator && (
          <CustomBreadCrumb
            link={["/app/admin/perros/listado", "Perros"]}
            current={infoPerro.nombre}
            className="mb-8"
          />
        )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="font-serif font-semibold text-5xl leading-[100%] tracking-[-2.5%] align-middle">
            {infoPerro.nombre}
          </h1>
          <div className="flex gap-2">
            {userType === UserType.Administrator && (
              <Button
                variant="outline"
                className="flex items-center gap-2 border-green-700 text-green-700 hover:bg-green-50 hidden"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Button>
            )}
            <RegistroSanidad />
          </div>
        </div>

        <div className="space-y-4 text-[#121F0D]">
          <Dato
            titulo="DUEÑO"
            valor={infoPerro.duenioNombre ? infoPerro.duenioNombre : ""}
          />
          {infoPerro.descripcion && (
            <Dato titulo="DESCRIPCIÓN" valor={infoPerro.descripcion} />
          )}
          {infoPerro.fortalezas && (
            <Dato titulo="FUERTES" valor={infoPerro.fortalezas} />
          )}
        </div>
      </div>

      {isOpenError && forbidden()}
    </>
  );
}
