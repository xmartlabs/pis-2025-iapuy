"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Dog, Plus, User, Calendar, Activity } from "lucide-react";
import { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";

const BASE_API_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export default function ListadoPerrosTable() {
  const [perros, setPerros] = useState<PerroDTO[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // Resetear a primera página al buscar
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  async function fetchPerros(
    pageNum: number,
    pageSize: number,
    query?: string,
    signal?: AbortSignal
  ): Promise<PaginationResultDto<PerroDTO> | null> {
    const p = Math.max(1, Math.trunc(Number(pageNum) || 1));
    const s = Math.max(1, Math.min(100, Math.trunc(Number(pageSize) || 12)));

    const url = new URL("/api/perros", BASE_API_URL);
    url.searchParams.set("page", String(p));
    url.searchParams.set("size", String(s));
    if (query && query.trim().length)
      url.searchParams.set("query", query.trim());

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const combinedSignal = signal ?? controller.signal;

    try {
      const resp = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: combinedSignal,
      });

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
        !Array.isArray((body as any).data)
      )
        throw new Error("Malformed API response");

      return body as PaginationResultDto<PerroDTO>;
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") {
        console.warn("fetchPerros aborted");
        return null;
      }
      console.error("fetchPerros error:", err);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchPerros(page, size, search, controller.signal).then((res) => {
      if (res) {
        console.log(res.data);
        setPerros(res.data);
        setTotalPages(res.totalPages ?? 1);
      }
      setLoading(false);
    });
    return () => controller.abort();
  }, [page, size, search]);

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("es-ES");
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Perros</h1>
          <p className="text-muted-foreground">
            Lista de perros registrados en el sistema
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 w-full md:w-[300px]"
            />
          </div>

          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Agregar perro</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="px-7">
          <CardTitle>Registros de perros</CardTitle>
          <CardDescription>{perros.length} perros encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Nombre</TableHead>
                <TableHead>Dueño</TableHead>
                <TableHead>Última vacunación</TableHead>
                <TableHead className="text-right">
                  Intervenciones este mes
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-[50px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : perros.length > 0 ? (
                perros.map((p) => (
                  <TableRow key={p.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Dog className="h-4 w-4 text-muted-foreground" />
                        {p.nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {p.User?.nombre ?? p.duenioId ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {p.RegistroSanidad
                          ? formatDate(
                              p.RegistroSanidad.Vacunas.fecha ??
                                p.updatedAt ??
                                p.createdAt
                            )
                          : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          Number(p.intervencionCount) > 0
                            ? "default"
                            : "secondary"
                        }
                        className="flex w-16 justify-center items-center gap-1 ml-auto"
                      >
                        <Activity className="h-3 w-3" />
                        {typeof Number(p.intervencionCount) === "number"
                          ? Number(p.intervencionCount)
                          : 0}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Dog className="h-8 w-8 text-muted-foreground" />
                      <p>No se encontraron perros</p>
                      <p className="text-sm text-muted-foreground">
                        {search
                          ? `Intenta ajustar los términos de búsqueda: "${search}"`
                          : "Intenta agregar un nuevo perro"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={
                        page <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Mostrar páginas alrededor de la actual
                    let pageNum = page;
                    if (page > 3 && page < totalPages - 2) {
                      pageNum = i + page - 2;
                    } else if (page >= totalPages - 2) {
                      pageNum = i + totalPages - 4;
                    } else {
                      pageNum = i + 1;
                    }

                    if (pageNum > totalPages) return null;

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pageNum);
                          }}
                          isActive={page === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={
                        page >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-sm text-muted-foreground text-center mt-2">
                Página {page} de {totalPages}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
