"use client";
import { Pencil, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { EventoSanidadDto } from "@/app/api/registros-sanidad/dtos/evento-sanidad.dto";
import { useSearchParams } from "next/navigation";

export default function DetallePerro() {
  const [infoPerro, setInfoPerro] = useState<any>(null);

  const searchParams = useSearchParams();
  const id: string = searchParams.get("id") ?? "";

  useEffect(() => {
    fetch(`/api/perros/detalles?id=${id}`)
      .then(
        (res) => res.json() as Promise<PaginationResultDto<EventoSanidadDto>>,
      )
      .then((paginationResult) => {
        setInfoPerro(paginationResult.data || []);
      })
      .catch(() => {
        setInfoPerro(null);
      });
  }, [id]);
  return (
    <>
      <div className="w-full px-4 sm:px-8 py-6">
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
            <li className="text-gray-400">/</li>
            <li className="font-medium text-gray-700">Mara</li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-serif font-bold text-[#1B2F13]">Mara</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-green-600 text-green-700 hover:bg-green-50"
            >
              <Pencil className="w-4 h-4" />
              Editar
            </Button>
            <Button className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700">
              <HeartPulse className="w-4 h-4" />
              Registrar sanidad
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6 text-sm sm:text-base">
          <div>
            <h3 className="text-xs font-semibold tracking-widest text-gray-500 mb-1">
              DUEÑO
            </h3>
            <p className="text-gray-800">Daniela Acosta</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest text-gray-500 mb-1">
              DESCRIPCIÓN
            </h3>
            <p className="text-gray-800">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sapien
              ornare vitae amet.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest text-gray-500 mb-1">
              FUERTES
            </h3>
            <p className="text-gray-800">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sapien
              ornare vitae amet.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
