"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import CustomSearchBar from "@/app/components/search-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import CustomPagination from "@/app/components/pagination";
import { BadgeDollarSign, Plus, Settings } from 'lucide-react';

import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import type { PaginationResultDto } from "@/lib/pagination/pagination-result.dto";
import { LoginContext } from "@/app/context/login-context";
import { useRouter } from "next/navigation";
import FilterDropdown, { type pairPerson } from "@/app/components/expenses/filter-dropdown";
import { Button } from "@/components/ui/button";
import { type ExpenseDto } from "@/app/app/admin/gastos/dtos/expenses.dto";
import { type FiltersExpenseDto } from "@/app/api/expenses/dtos/initial-filter.dto";

const statuses = ["Pendiente de Pago", "Pagado"];

function formatMonthYear(ts: string | number | Date) {
  const d = new Date(ts);
  const monthShort = d
    .toLocaleString("es-ES", { month: "short" })
    .replace(".", "");
  const monthCap = monthShort.charAt(0).toUpperCase() + monthShort.slice(1);
  return `${monthCap} ${d.getFullYear()}`;
}

//! import AddExpenseButton from "...";

export default function ExpensesList() {

  const [expense, setExpense] = useState<ExpenseDto[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [peopleWhoHaveExpent , setPeopleWhoHaveExpent] = useState<pairPerson[]>([]);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [reload] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  const context = useContext(LoginContext);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  function go(id: string) {
    router.push(`/app/admin/gastos/detalles?id=${id}`);
  }

  const fetchExpenses = useCallback(
    async (
      pageNum: number,
      pageSize: number,
      query?: string,
      signal?: AbortSignal,
      triedRefresh = false
    ): Promise<PaginationResultDto<ExpenseDto> | null> => {
      const p = Math.max(1, Math.trunc(Number(pageNum) || 1));
      const s = Math.max(1, Math.min(100, Math.trunc(Number(pageSize) || 12)));
      const url = new URL(
        "/api/expenses",
        (typeof window !== "undefined" && window.location?.origin) || ""
      );
      url.searchParams.set("page", String(p));
      url.searchParams.set("size", String(s));
      if (query?.trim().length)
        {url.searchParams.set("query", query.trim())};
      if (selectedMonths && selectedMonths.length)
        {url.searchParams.set("months", selectedMonths.join(","))};
      if (selectedStatuses && selectedStatuses.length)
        {url.searchParams.set("statuses", selectedStatuses.join(","))};
      if (selectedPeople && selectedPeople.length)
        {url.searchParams.set("people", selectedPeople.join(","))};

      const controller = new AbortController();
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
          const resp2 = await fetch(
            new URL(
              "/api/auth/refresh",
              (typeof window !== "undefined" && window.location?.origin) || ""
            ),
            {
              method: "POST",
              headers: { Accept: "application/json" },
              signal: combinedSignal,
            }
          );

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
                const errTxt = txt ? ` - ${txt}` : "";
                throw new Error(
                  `API ${retryResp.status}: ${retryResp.statusText}${errTxt}`
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
                  (body2 as PaginationResultDto<ExpenseDto>).data
                )
              )
                throw new Error("Malformed API response");
              return body2 as PaginationResultDto<ExpenseDto>;
            }
          }
        }

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          const errTxt = txt ? ` - ${txt}` : "";
          throw new Error(`API ${resp.status}: ${resp.statusText}${errTxt}`);
        }

        const ct = resp.headers.get("content-type") ?? "";
        if (!ct.includes("application/json"))
          throw new Error("Expected JSON response");

        const body = (await resp.json()) as unknown;
        if (
          !body ||
          typeof body !== "object" ||
          !Array.isArray((body as PaginationResultDto<ExpenseDto>).data)
        )
          throw new Error("Malformed API response");
        return body as PaginationResultDto<ExpenseDto>;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") {
          return null;
        }
        return null;
      } finally {
        clearTimeout(timeout);
      }
    },
    [context, selectedMonths, selectedStatuses, selectedPeople]
  );

  const fetchExpensesFilters = useCallback(
    async (
      signal?: AbortSignal,
      triedRefresh = false
    ): Promise<FiltersExpenseDto | null> => {
      const url = new URL(
        "/api/expenses/filter",
        (typeof window !== "undefined" && window.location?.origin) || ""
      );

      const controller = new AbortController();
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
          const resp2 = await fetch(
            new URL(
              "/api/auth/refresh",
              (typeof window !== "undefined" && window.location?.origin) || ""
            ),
            {
              method: "POST",
              headers: { Accept: "application/json" },
              signal: combinedSignal,
            }
          );

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
                  `API ${retryResp.status}: ${retryResp.statusText}${txt ? ` - ${txt}` : ""}`
                );
              }

              const ct2 = retryResp.headers.get("content-type") ?? "";
              if (!ct2.includes("application/json"))
                throw new Error("Expected JSON response");

              const body2 = (await retryResp.json()) as unknown;
              if (
                !body2 ||
                typeof body2 !== "object" ||
                !Array.isArray((body2 as FiltersExpenseDto).months)
              )
                throw new Error("Malformed API response");

              return body2 as FiltersExpenseDto;
            }
          }
        }

        if (!resp.ok) {
          const txt = await resp.text().catch(() => "");
          throw new Error(`API ${resp.status}: ${resp.statusText}${txt ? ` - ${txt}` : ""}`);
        }

        const ct = resp.headers.get("content-type") ?? "";
        if (!ct.includes("application/json"))
          throw new Error("Expected JSON response");

        const body = (await resp.json()) as unknown;
        if (
          !body ||
          typeof body !== "object" ||
          !Array.isArray((body as FiltersExpenseDto).months)
        )
          throw new Error("Malformed API response");

        return body as FiltersExpenseDto;
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") {
          return null;
        }
        return null;
      } finally {
        clearTimeout(timeout);
      }
    },
    [context]
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchExpensesFilters(controller.signal)
      .then((res) => {
        if (res) {
          setPeopleWhoHaveExpent(res.people ?? []);
          setAvailableMonths(res.months ?? []); 
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [fetchExpensesFilters]);


  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchExpenses(page, size, search, controller.signal)
      .then((res) => {
        if (res) {
          setExpense(res.data);
          setTotalPages(res.totalPages ?? 1);
          
          if(res.totalPages < res.page) {
            setPage(1);
          }

          if (availableMonths.length === 0) {
            try {
              const map = new Map<string, number>();
              res.data.forEach((exp) => {
                const d = new Date(exp.fecha);
                if (isNaN(d.getTime())) return;
                const key = formatMonthYear(d);
                const monthStart = new Date(
                  d.getFullYear(),
                  d.getMonth(),
                  1
                ).getTime();
                if (!map.has(key)) map.set(key, monthStart);
              });
              const sorted = Array.from(map.entries())
                .sort((a, b) => b[1] - a[1])
                .map((e) => e[0]);
              setAvailableMonths(sorted);
            } catch {
              setAvailableMonths([]);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, size, search, reload, fetchExpenses, availableMonths.length, peopleWhoHaveExpent.length]);

  const onFilterSelectionChange = (
    monthsSelected: string[],
    statusesSelected: string[],
    peopleSelected : string[]
  ) => {
    setSelectedMonths(monthsSelected);
    setSelectedStatuses(statusesSelected);
    setSelectedPeople(peopleSelected)
  };

  return (
  <div className="max-w-[92%]">
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-3">
      <div className="flex items-center gap-3">
        <BadgeDollarSign className="h-[46px] w-[46px] text-[rgba(0, 0, 0, 1)]" />
        <h1
          className="text-5xl sm:text-4xl lg:text-5xl leading-none font-semibold tracking-[-0.025em] flex items-center"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Gastos
        </h1>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          className="h-10 max-w-[141px] min-w-[80px] rounded-md flex gap-1 p-2.5 bg-[#5B9B40]
                     font-sans font-medium text-sm leading-6 text-[#EFF5EC]
                     transition-colors hover:bg-[#478032] hover:text-white"
        >
          <span className="flex text-[#EFF5EC]">
            <Plus size={16} />
          </span>
          Agregar Gasto
        </Button>
        <Button
          className="bg-[#DEEBD9] text-[#5B9B40] flex w-10 h-10 border-2 rounded-md gap-2
                     opacity-100 hover:bg-[#5B9B40] hover:text-white hover:border-white
                     transition duration-300 ease-in-out"
        >
          <Settings className="w-[20px] h-[20px]" />
        </Button>
      </div>
    </div>

    <div className="flex justify-end mb-2 pb-2 pt-3 gap-5">
      <CustomSearchBar searchInput={searchInput} setSearchInput={setSearchInput} />
      <FilterDropdown
        months={availableMonths}
        statuses={statuses}
        people= {peopleWhoHaveExpent}
        initialSelectedMonths={selectedMonths}
        initialSelectedStatuses={selectedStatuses}
        initialSelectedPeople={selectedPeople}
        onSelectionChangeAction={onFilterSelectionChange}
      />
    </div>

    <div className="mx-auto w-full border border-gray-300 pb-2 rounded-lg">
      <div className="sm:w-full overflow-x-auto">
        <Table className="table-fixed border-collapse">
          <TableHeader>
            <TableRow
              className="bg-gray-50 border-b border-gray-200 font-medium font-sm leading-[1.1] text-[#F3F4F6]"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              <TableHead className="w-[200px] pl-3 text-left">Fecha y hora</TableHead>
              <TableHead className="w-[200px] pl-3 text-left">Tipo</TableHead>
              <TableHead className="w-[200px] pl-3 text-left">Monto</TableHead>
              <TableHead className="w-[200px] pl-3 text-left">Persona</TableHead>
              <TableHead className="w-[150px] pl-3 text-left">Estado</TableHead>
              <TableHead className="w-[40px] pl-0 text-left"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              ["s1", "s2", "s3", "s4", "s5", "s6", "s7"].map((key) => (
                <TableRow key={key} className="px-6 py-4">
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-[140px]" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-[160px]" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-[110px]" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[40px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : expense && expense.length > 0 ? (
              expense.map((exp) => (
                <TableRow
                  key={exp.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                  onClick= { () => {go(exp.id)} }
                >
                  <TableCell className="p-3">
                    {`${new Date(exp.fecha).toLocaleDateString("es-UY", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })} ${new Date(exp.fecha).toLocaleTimeString("es-UY", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                  </TableCell>

                  <TableCell className="p-3">{exp.type}</TableCell>

                  <TableCell className="p-3">${exp.amount}</TableCell>

                  <TableCell className="p-3">{exp.user?.nombre ?? exp.userId}</TableCell>

                  <TableCell className="p-3">
                    <div className="bg-[#F2F4F8] px-2 py-1 rounded-[10px] w-min">
                      {exp.state}
                    </div>
                  </TableCell>

                  <TableCell className="w-[40px] mr-0">
                    <ArrowRight />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-36 px-6 py-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      {search
                        ? `Intenta ajustar los términos de búsqueda: "${search}"`
                        : "No se encuentran Gastos"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>

    <CustomPagination page={page} totalPages={totalPages} setPage={setPage} />
  </div>
);
}