import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface CustomPaginationProps {
  page: number;
  totalPages: number;
  setPage: (v:number) => void
}

export default function CustomPagination({ page, totalPages, setPage }: CustomPaginationProps) {
    return <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <Pagination>
                {/* added gap here */}
                <PaginationContent className="flex items-center gap-3">
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (page > 1) setPage(page - 1);
                            }}
                            className={
                                page <= 1 ? "pointer-events-none opacity-40" : ""
                            }
                        />
                    </PaginationItem>

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (page < totalPages) setPage(page + 1);
                            }}
                            className={
                                page >= totalPages
                                    ? "pointer-events-none opacity-40"
                                    : ""
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
        <div className="text-muted-foreground text-center">
            Página {page} de {totalPages}
        </div>
    </div>;
}