"use client";
import { useRouter } from "next/navigation";
//import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  //TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Plus } from "lucide-react";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { LoginContext } from "@/app/context/login-context";
import CustomPagination from "@/app/components/pagination";
import CustomSearchBar from "@/app/components/search-bar";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { type InstitutionDto } from "../../app/admin/instituciones/dtos/institution.dto";

export default function InstitutionList() {
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const context = useContext(LoginContext);
  const router = useRouter();

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Resetear a primera página al buscar
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    async function fetchInstitutions(
      pageNum: number,
      pageSize: number,
      query?: string,
      signal?: AbortSignal,
      triedRefresh = false
    ): Promise<PaginationResultDto<InstitutionDto> | null> {
      const p = Math.max(1, Math.trunc(Number(pageNum) || 1));
      const s = Math.max(1, Math.min(100, Math.trunc(Number(pageSize) || 12)));

      const qs = new URLSearchParams();
      qs.set("page", String(p));
      qs.set("size", String(s));
      if (query?.trim().length) qs.set("query", query.trim());
      const url = `/api/instituciones?${qs.toString()}`;
      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);
      const combinedSignal = signal ?? controller.signal;

      try {
        const token = context?.tokenJwt;
        const baseHeaders: Record<string, string> = {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const resp = await fetch(url.toString(), {
          method: "GET",
          headers: baseHeaders,
          signal: combinedSignal,
        });

        if (!resp.ok && !triedRefresh && resp.status === 401) {
          const resp2 = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { Accept: "application/json" },
            signal: combinedSignal,
          });

          if (resp2.ok) {
            const refreshBody = (await resp2.json().catch(() => null)) as {
              accessToken?: string;
            } | null;

            const newToken = refreshBody?.accessToken ?? null;
            if (newToken) {
              context?.setToken(newToken);
              const retryResp = await fetch(url.toString(), {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  Authorization: `Bearer ${newToken}`,
                },
                signal: combinedSignal,
              });

              if (!retryResp.ok) {
                const txt = await retryResp.text().catch(() => "");
                throw new Error(
                  `API ${retryResp.status}: ${retryResp.statusText}${
                    txt ? ` - ${txt}` : ""
                  }`
                );
              }

              const ct2 = retryResp.headers.get("content-type") ?? "";
              if (!ct2.includes("application/json"))
                throw new Error("Expected JSON response");

              const body2 = (await retryResp.json()) as unknown;
              if (
                !body2 ||
                typeof body2 !== "object" ||
                !Array.isArray(
                  (body2 as PaginationResultDto<InstitutionDto>).data
                )
              )
                throw new Error("Malformed API response");

              return body2 as PaginationResultDto<InstitutionDto>;
            }
          }
        }

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(
            `API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`
          );
        }

        const ct = resp.headers.get("content-type") ?? "";
        if (!ct.includes("application/json"))
          throw new Error("Expected JSON response");

        const body = (await resp.json()) as unknown;
        if (
          !body ||
          typeof body !== "object" ||
          !Array.isArray((body as PaginationResultDto<InstitutionDto>).data)
        )
          throw new Error("Malformed API response");

        return body as PaginationResultDto<InstitutionDto>;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") {
          return null;
        }
        return null;
      } finally {
        clearTimeout(timeout);
      }
    }
    fetchInstitutions(page, size, search, controller.signal)
      .then((res) => {
        if (res) {
          setInstitutions(res.data);
          setTotalPages(res.totalPages ?? 1);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, size, search, context]);

  function go(id: string) {
    router.push(`/app/admin/instituciones/detalle?id=${id}`);
  }

  return (
    <div className=" max-w-[95%] p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="w-full h-[48px] flex justify-between opacity-100 mb-[32px]">
          <div className="flex items-center gap-3">
            <Building className="h-[46px] w-[46px] text-[rgba(0, 0, 0, 1)]" />
            <h1 className="font-serif font-semibold text-5xl leading-[100%] tracking-[-2.5%] align-middle">
              Instituciones
            </h1>
          </div>
          <Button
            onClick={() => {
              router.push("/app/admin/instituciones/nueva");
            }}
            className="ml-4 text-sm leading-6 medium !bg-[var(--custom-green)] !text-white w-full sm:w-auto"
          >
            <Plus size={16} />
            Agregar institución
          </Button>
        </div>
      </div>
      <div className="flex justify-start sm:justify-end items-center">
        <CustomSearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
        />
      </div>

      <div className="mx-auto w-full border border-gray-300 mt-4 rounded-lg">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-full table-fixed border-collapse">
            <TableHeader>
              <TableRow className="border-b border-gray-200 -mt-px">
                <TableHead className="px-6 py-3 text-left text-sm font-medium  first:rounded-tl-lg last:rounded-tr-lg">
                  Nombre
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-sm font-medium  first:rounded-tl-lg last:rounded-tr-lg">
                  Referentes
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="px-6 py-4">
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[140px]" />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Skeleton className="h-4 w-[160px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : institutions.length > 0 ? (
                institutions.map((p) => (
                  <TableRow
                    key={p.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => {
                      go(p.id);
                    }}
                  >
                    <TableCell className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="text-base md:text-base ml-2">
                          {p.nombre}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2 text-sm">
                        {p.InstitutionContacts.map((contact, index) => (
                          <span key={contact.id || index}>
                            {contact.name} - {contact.contact}
                            {index < p.InstitutionContacts.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-36 px-6 py-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-muted-foreground">
                        {search
                          ? `Intenta ajustar los términos de búsqueda: "${search}"`
                          : "No hay datos disponibles"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <CustomPagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        )}
      </div>
    </div>
  );
}
