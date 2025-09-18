"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {ArrowLeft, ArrowRight, Pencil, Trash2} from "lucide-react";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import type { EventoSanidadDto } from "@/app/api/registros-sanidad/dtos/evento-sanidad.dto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";


export default function HistorialSanidad() {
  const [registros, setRegistros] = useState<EventoSanidadDto[]>([]);
    const [page, setPage] = useState<number>(1);
    const [size] = useState<number>(5);
    const [totalPages, setTotalPages] = useState<number>(1);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenError, setIsOpenError] = useState(false);

  const searchParams = useSearchParams();
  const id: string = searchParams.get("id") ?? "";

  useEffect(() => {
    fetch(`/api/registros-sanidad?id=${encodeURIComponent(id)}&page=${page}&size=${size}`)
      .then((res) => res.json() as Promise<PaginationResultDto<EventoSanidadDto>>)
      .then((paginationResult) => {
        setRegistros(paginationResult.data || []);
        console.log(paginationResult.data);
        setTotalPages(paginationResult.totalPages || 1);
      })
      .catch(() => {
        setRegistros([]);
        setIsOpenError(true);
      });
  }, [id]);

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage((prev) => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    const columnToAttribute: Record<string, string> = {
        Fecha: "fecha",
        Actividad: "actividad",
    };
    const columnHeader: string[] = [
        "Fecha",
        "Actividad",
    ];

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
                <TableHead className="w-[200px]" key={columnHeader[0]}>
                  {columnHeader[0]}
                </TableHead>
                <TableHead key={columnHeader[1]}>{columnHeader[1]}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {registros && registros.length > 0 ? (registros.map((registro, i) => (
                <TableRow key={i} className="h-[56px]">
                  {Object.keys(columnToAttribute).map((column, index) => {
                      const attr: string = columnToAttribute[column];
                      const value: string = registro[attr as keyof EventoSanidadDto];
                      return (
                          <TableCell key={column}>
                              {String(value)}
                          </TableCell>
                      );
                  })}
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
              ))) : null}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="mt-4 sm:mt-[5px] flex justify-center items-center gap-2">
          <Button
              onClick={handlePreviousPage}
              disabled={page === 1}
              size="sm"
              className="px-3 py-2"
          >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1"></span>
          </Button>
          <Button
              onClick={handleNextPage}
              disabled={page === totalPages}
              size="sm"
              className="px-3 py-2"
          >
              <span className="hidden sm:inline mr-1"></span>
              <ArrowRight className="w-4 h-4" />
          </Button>
      </div>
      <div className="mt-2 sm:mt-[5px] flex justify-center items-center">
          <p className="text-xs sm:text-sm leading-6 medium text-center">
              Página {page} de {totalPages}
          </p>
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
