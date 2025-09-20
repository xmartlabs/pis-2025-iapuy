"use client";
import { Pencil, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const info = {
  name: "Firulais",
  duenio: "Juan Pérez",
  descripcion: "Un perro amigable y juguetón.",
    fortalezas: "Muy leal y protector.",
};

export function Dato({ titulo, valor } : { titulo: string; valor: string }) {
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

export default function DetallePerro() {
  const [infoPerro, setInfoPerro] = useState<any>(info);

  const searchParams = useSearchParams();
  const id: string = searchParams.get("id") ?? "";

  useEffect(() => {
    fetch(`/api/perros/detalles?id=${id}`)
      .then((res) => res.json() as Promise<PerroDTO>)
      .then((paginationResult) => {
        setInfoPerro(paginationResult.data || info);
      })
      .catch(() => {
        setInfoPerro(info);
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
              {infoPerro.name}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1
            className="text-3xl font-serif font-bold text-[#1B2F13]"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {infoPerro.name}
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
            <Dato titulo="DUEÑO" valor={infoPerro.duenio} />
            <Dato titulo="DESCRIPCIÓN" valor={infoPerro.descripcion} />
            <Dato titulo="FUERTES" valor={infoPerro.fortalezas} />
        </div>
      </div>
    </>
  );
}
