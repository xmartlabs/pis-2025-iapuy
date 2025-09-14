"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RegistroSanidadApiResponse = {
  listadoRegistros: Registro[];
  error?: string;
};

type Registro = { Fecha: string; Actividad: string };
const attributes: string[] = ["Fecha", "Actividad"];

export default function HistorialSanidad() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenError, setIsOpenError] = useState(false);

  const searchParams = useSearchParams();
  const id: string = searchParams.get("id") ?? "";

  useEffect(() => {
    fetch(`/api/registros-sanidad?id=${encodeURIComponent(id)}`)
      .then((res) => res.json() as Promise<RegistroSanidadApiResponse>)
      .then((data) => {
        let regs: Registro[] = [];
        if (data.listadoRegistros) {
          regs = data.listadoRegistros;
        }
        setRegistros(regs);
      })
      .catch(() => {
        setIsOpenError(true);
      });
  }, [id]);

  return (
    <>
      <div className="flex flex-col gap-5 mb-4">
        <h2 className="font-serif font-semibold text-xl text-[#1B2F13]">
          Historial de sanidad
        </h2>
        <div className="rounded-md border">
          <Table className="min-w-full table-fixed">
            <TableHeader className="h-[48px] text-sm font-semibold text-gray-700 pointer-events-none">
              <TableRow>
                <TableHead className="w-[200px]" key={attributes[0]}>
                  {attributes[0]}
                </TableHead>
                <TableHead key={attributes[1]}>{attributes[1]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {registros.map((registro, i) => (
                <TableRow key={i} className="h-[56px]">
                  {attributes.map((attr) => (
                    <TableCell key={attr}>
                      {String(registro[attr as keyof Registro] ?? "")}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex flex-row justify-end text-green-500 hover:text-green-700">
                      <button
                        className=" w-[3%] mx-6"
                        onClick={() => {
                          setIsOpenEdit(true);
                        }}
                      >
                        <Pencil />
                      </button>
                      <button className=" w-[3%] mx-6">
                        <Trash2 />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {isOpenEdit && (
        <div className="fixed inset-0 bg-gray-500/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Editar X</h2>
            <p>Este es el contenido del modal.</p>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setIsOpenEdit(false);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isOpenError && (
        <div className="fixed inset-0 bg-gray-500/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>Hubo un problema con el servidor</p>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setIsOpenError(false);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
