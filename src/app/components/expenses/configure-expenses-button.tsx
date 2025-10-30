import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import FixedExpensesConfigDialog from "@/components/fixed-expenses-config-dialog";

export default function ConfigureExpensesButton({
  onCreated,
}: {
  readonly onCreated?: () => void;
}) {
  const [openFixedExpenses, setOpenFixedExpenses] = useState(false);

  useEffect(() => {
    if (onCreated) onCreated();
  }, [onCreated, openFixedExpenses]);

  return (
    <>
        <Button
          type="button"
          className="bg-[#DEEBD9] text-[#5B9B40] flex w-10 h-10 border-2 rounded-md gap-2
                     opacity-100 hover:bg-[#5B9B40] hover:text-white hover:border-white
                     transition duration-300 ease-in-out"
          onClick={() => {
              setOpenFixedExpenses(true);
            }}
        >
          <Settings className="w-[20px] h-[20px]" />
        </Button>

      <FixedExpensesConfigDialog
        open={openFixedExpenses}
        onOpenChange={setOpenFixedExpenses}/>
    </>
  );
}
