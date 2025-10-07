"use client";
import { useRouter } from "next/navigation";
//import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  //TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
//import { Skeleton } from "@/components/ui/skeleton";
import {Building,Plus } from "lucide-react";
//import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
//import { LoginContext } from "@/app/context/login-context";
//import { useRouter } from "next/navigation";
//import CustomPagination from "@/app/components/pagination";
import CustomSearchBar from "@/app/components/search-bar";
import { Button } from "@/components/ui/button";

export default function InstitutionList() {
  const router = useRouter();

  return (
    <div className=" max-w-[95%] p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 mb-[32px]">
          <div className="flex items-center gap-3">
            <Building className="h-[46px] w-[46px] text-[rgba(0, 0, 0, 1)]" />
            <h1 className="text-5xl font-extrabold tracking-tight ">Instituciones</h1>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <CustomSearchBar searchInput={""} setSearchInput={() => {}} />
          <Button
             onClick={() => { router.push("/app/admin/instituciones/nueva");}}
            className="ml-4 text-sm leading-6 medium !bg-[var(--custom-green)] !text-white w-full sm:w-auto"
          >
            <Plus size={16} />
            Agregar institución
          </Button>
        </div>
      </div>
      <div className="mx-auto w-full border border-gray-300 pb-2 rounded-lg">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-full table-fixed border-collapse">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200 -mt-px">
                <TableHead className="w-[240px] px-6 py-3 text-left text-sm font-medium text-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
                  Nombre
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
                  Referente
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
                  Contacto
                </TableHead>
                <TableHead className="px-6 py-3 text-center text-sm font-medium text-gray-700 first:rounded-tl-lg last:rounded-tr-lg">
                  Estado de cuenta
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 bg-white">
              
            </TableBody>
          </Table>
        </div>

        {/*totalPages > 1 && (
          <CustomPagination page={page} totalPages={totalPages} setPage={setPage} />
        )*/}
      </div>
    </div>
  );
}
