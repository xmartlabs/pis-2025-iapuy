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
  className = "",
  ariaLabel = "Agregar intervención",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-3 px-5 py-3 rounded-lg border-2 border-slate-800 bg-white shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 transition${
        className ? ` ${className}` : ""
      }`}
    >
      <span className="flex items-center justify-center rounded-sm">
        <Plus size={16} />
      </span>

      <span className="font-semibold text-slate-800 leading-none">{label}</span>
    </button>
  );
}
