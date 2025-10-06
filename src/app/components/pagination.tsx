import React from "react";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface CustomPaginationProps {
    page: number;
    totalPages: number;
    setPage: (v: number) => void;
}

function getDisplayedPages(page: number, totalPages: number) {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | string)[] = [];
    const left = Math.max(2, page - 2);
    const right = Math.min(totalPages - 1, page + 2);

    pages.push(1);
    if (left > 2) pages.push("...");

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
}

export default function CustomPagination({ page, totalPages, setPage }: CustomPaginationProps) {
    const pages = getDisplayedPages(page, totalPages);

    return (
        <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <Pagination>
                    <PaginationContent className="flex items-center gap-3">
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) setPage(page - 1);
                                }}
                                className={page <= 1 ? "pointer-events-none opacity-40 text-[#5B9B40]" : "text-[#5B9B40]"} />
                        </PaginationItem>

                        {/* Page number buttons */}
                        <div className="flex items-center gap-2">
                            {pages.map((p, idx) => {
                                if (p === "...") {
                                    return (
                                        <span key={`dots-${idx}`} className="px-2 py-1 text-sm text-[#5B9B40]">
                                            ...
                                        </span>
                                    );
                                }

                                const num = p as number;
                                const isCurrent = num === page;

                                return (
                                    <button
                                        key={num}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (num !== page) setPage(num);
                                        }}
                                        aria-current={isCurrent ? "page" : undefined}
                                        className={`px-3 py-1 text-sm text-[#5B9B40] rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1 ${isCurrent ? "border border-[#5B9B40]" : "hover:underline"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                );
                            })}
                        </div>

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < totalPages) setPage(page + 1);
                                }}
                                className={page >= totalPages ? "pointer-events-none opacity-40 text-[#5B9B40]" : "text-[#5B9B40]"} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
