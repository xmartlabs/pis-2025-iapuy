import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Plus } from "lucide-react";
import ExpenseDialog from "@/app/components/expenses/intervention-expense-dialog"
import Link from "next/link";

export default function AddExpenseButton() {
    return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
        </DropdownMenuTrigger>
        <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={4}
            className="border !border-[#BDD7B3]"
        >
            <DropdownMenuItem asChild>
                <Link href={"/app/perfil"}>Sanidad de un perro</Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
                <ExpenseDialog/>
            </DropdownMenuItem>
            </DropdownMenuContent>
    </DropdownMenu>
    );
}