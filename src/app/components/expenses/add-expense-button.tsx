import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,DropdownMenuItem } from "@/components/ui/dropdown-menu";
import ExpenseDialogOne from "@/app/components/expenses/intervention-expense-dialog-step-one"
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ExpenseDialogTwo from "@/app/components/expenses/intervention-expense-dialog-step-two"
export default function AddExpenseButton({ onCreated }: { readonly onCreated?: () => void }) {
    const [openDialogIntervention, setOpenDialogIntervention] = useState(false);
    const [openStepTwo, setOpenStepTwo] = useState(false);
    const [selectedIntervention, setSelectedIntervention] = useState("");
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
            
            <DropdownMenuItem
            onClick={() => { setOpenDialogIntervention(true); }} 
            >
                Gasto en intervención
            </DropdownMenuItem>
        </DropdownMenuContent>
        {openDialogIntervention && (
            <ExpenseDialogOne
            open={openDialogIntervention}
            selectedIntervention={selectedIntervention}
            onOpenChange={setOpenDialogIntervention}
            setSelectedIntervention={setSelectedIntervention}
            setOpenStepTwo={setOpenStepTwo}
            />
        )}
                {openStepTwo && (
                <ExpenseDialogTwo
                    open={openStepTwo}
                    onOpenChange={setOpenStepTwo}
                    InterventionID={selectedIntervention}
                    onCreated={onCreated}
                />
            )}
    </DropdownMenu>
    );
}