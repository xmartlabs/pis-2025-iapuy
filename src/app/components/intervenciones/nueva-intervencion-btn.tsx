import React from "react";
import { Plus } from "lucide-react";

type Props = {
  onClick?: () => void;
  label?: string;
  className?: string;
  ariaLabel?: string;
};

export default function AddIntervencionButton({
  onClick,
  label = "Agregar intervención",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-[184px] h-10 min-w-[80px] rounded-md flex 
              items-center justify-center gap-1 p-2.5 bg-[#5B9B40]
              font-sans font-medium text-sm leading-6 text-[#EFF5EC]
              transition-colors hover:bg-[#478032] hover:text-white"
    >
      <span className="flex items-center justify-center rounded-sm text-[#EFF5EC]">
        <Plus size={16} />
      </span>
      {label}
    </button>
  );
}
