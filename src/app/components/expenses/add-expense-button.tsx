import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ExpenseDialogOne from "@/app/components/expenses/intervention-expense-dialog-step-one";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ExpenseDialogTwo from "@/app/components/expenses/intervention-expense-dialog-step-two";
import PerroSanidadFormDialog from "@/components/perro-sanidad-form-dialog";

export default function AddExpenseButton({
  onCreated,
}: {
  readonly onCreated?: () => void;
}) {
  const [openDialogIntervention, setOpenDialogIntervention] = useState(false);
  const [openStepTwo, setOpenStepTwo] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState("");
  const [openSanidad, setOpenSanidad] = useState(false);

  useEffect(() => {
    if (onCreated) onCreated();
  }, [onCreated, openSanidad]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            className="h-10 max-w-[141px] min-w-[80px] rounded-md flex gap-1 p-2.5 bg-[#5B9B40]
                          font-sans font-medium text-sm leading-6 text-[#EFF5EC]
                          transition-colors hover:bg-[#478032] hover:text-white"
          >
            <Plus className="text-[#EFF5EC]" size={16} />
            <span>Agregar Gasto</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={4}
          className="border !border-[#BDD7B3]"
        >
          <DropdownMenuItem
            onClick={() => {
              setOpenSanidad(true);
            }}
          >
            Sanidad de un perro
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              setOpenDialogIntervention(true);
            }}
          >
            Gasto en intervención
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PerroSanidadFormDialog
        open={openSanidad}
        onOpenChange={setOpenSanidad}
      />

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
    </>
  );
}
