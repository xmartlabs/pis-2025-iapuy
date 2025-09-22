"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Pencil, Trash2 } from "lucide-react";
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
    fetch(
      `/api/registros-sanidad?id=${encodeURIComponent(id)}&page=${page}&size=${size}`,
    )
      .then(
        (res) => res.json() as Promise<PaginationResultDto<EventoSanidadDto>>,
      )
      .then((paginationResult) => {
        setRegistros(paginationResult.data || []);
        setTotalPages(paginationResult.totalPages || 1);
      })
      .catch(() => {
        setRegistros([]);
        setIsOpenError(true);
      });
  }, [id, page, size]);

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

  const columnHeader: string[] = ["Fecha", "Actividad"];

  return (
    <>
      <div className="flex flex-col gap-5 mb-4 w-full">
        <h2 className="font-serif font-semibold text-xl text-[#1B2F13] tracking-tight font-size-text-2xl font-family-font-serif" style={{ fontFamily: "Poppins, sans-serif" }}>
          Historial de sanidad
        </h2>
        <div className="rounded-md border  w-full font-normal" style={{ fontFamily: "Archivo, sans-serif" }}>
          <Table className="w-full table-fixed overflow-x-scroll">
            <TableHeader className="h-[48px] text-sm text-gray-700 pointer-events-none w-full" >
              <TableRow>
                <TableHead className="w-[110px] min-w-[110px] sm:w-[200px] px-4 font-medium" key={columnHeader[0]}>
                  {columnHeader[0]}
                </TableHead>
                <TableHead className="px-4 w-[105px] sm:w-full min-w[105px] font-medium" key={columnHeader[1]}>{columnHeader[1]}</TableHead>
                <TableHead className="w-[96px] px-2 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {registros && registros.length > 0
                ? registros.map((registro, i) => (
                    <TableRow key={i}>
                          <TableCell
                            className={`h-[56px] min-w-[120px] px-4 sm:px-4 text-sm font-normal`}
                          >
                            {String(registro.fecha)}
                          </TableCell>
                          <TableCell
                              className={`h-[56px] px-4 text-sm font-normal`}
                          >
                              {String(registro.actividad)}
                          </TableCell>
                      <TableCell className="min-w-[96px] px-2 text-green-500 hover:text-green-700">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="shrink-0 p-1"
                            onClick={() => {
                              setIsOpenEdit(true);
                            }}
                          >
                            <Pencil />
                          </button>
                          <button className="shrink-0 p-1">
                            <Trash2 />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
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
