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
import { EditDogDialog } from "@/app/app/admin/perros/edit-dog";
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
  const [isOpenEdit, setOpenEdit] = useState(false);
  const [reload, setReload] = useState(false);
  const context = useContext(LoginContext);
  const fetchDetallesPerro = useCallback(
    async (id: string): Promise<ApiResponse> => {
      const token = context?.tokenJwt;
      const baseHeaders: Record<string, string> = {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const triedRefresh = false;

      const resp = await fetch(`/api/perros/detalles?id=${id}`, {
        method: "GET",
        headers: baseHeaders,
      });
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
            const retryResp = await fetch(`/api/perros/detalles?id=${id}`, {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${newToken}`,
              },
            });

            return (await retryResp.json()) as Promise<Promise<ApiResponse>>;
          }
        }
      }
      return (await resp.json()) as Promise<ApiResponse>;
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
  }, [id]);
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
              <Button
                onClick={() => {
                  setOpenEdit(true);
                }}
                variant="outline"
                className="flex items-center gap-2 border-green-700 text-green-700 hover:bg-green-50"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </Button>
            <RegistroSanidad />
          </div>
        </div>
          <EditDogDialog
            reload={reload}
            setReload={setReload}
            open={isOpenEdit}
            setOpen={setOpenEdit}
            dogDetails={infoPerro}
            admin={userType === UserType.Administrator}
          />

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
