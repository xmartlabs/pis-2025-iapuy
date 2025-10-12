import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteIntervention() {
  return (
    <Button
      variant="destructive"
      className="bg-red-600 hover:bg-red-700 text-white flex items-center"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Eliminar intervención
    </Button>
  );
}
