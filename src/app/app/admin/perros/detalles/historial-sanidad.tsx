"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Trash } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

type RegistroSanidadApiResponse = {
  attributes: string[];
  listadoRegistros: Registro[];
  error?: string;
};

type Registro = { Fecha: string; Actividad: string };

export default function HistorialSanidad() {
  const [attributes, setAttributes] = useState<string[]>([]);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  useEffect(() => {
    fetch(`/api/registros-sanidad?id=${encodeURIComponent(id)}`)
      .then((res) => res.json() as Promise<RegistroSanidadApiResponse>)
      .then((data) => {
        setAttributes(data.attributes);
        let regs: Registro[] = [];
        if (data.listadoRegistros) {
          regs = data.listadoRegistros;
        }
        setRegistros(regs);
        //console.log(data.error);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
      });
  }, []);
  return (
    <>
      <div className="w-[1116px] h-[212px] flex flex-col gap-5 rotate-0 opacity-100">
        <h2 className="font-serif font-semibold text-xl text-[#1B2F13] w-[233] h-[32] opacity-100">
          Historial de sanidad
        </h2>
        <Table className="w-full rounded border border-gray-300 overflow-hidden">
          <TableHeader className="bg-gray-50">
            <TableRow>
              {attributes.map((attr) => (
                <TableHead
                  className="px-4 py-2 text-left text-sm font-semibold text-gray-700"
                  key={attr}
                >
                  {attr}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200">
            {registros.map((registro, i) => (
              <TableRow className="px-4 py-2" key={i}>
                {attributes.map((attr) => (
                  <TableCell key={attr}>
                    {String(registro[attr as keyof Registro] ?? "")}
                  </TableCell>
                ))}
                <TableCell key="actions">
                  <div className="flex space-x-4">
                    <button className="text-green-500 hover:text-green-700">
                      <Pencil className="h-6 w-6" />
                    </button>
                    <button className="text-green-500 hover:text-green-700">
                      <Trash className="h-6 w-6" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
