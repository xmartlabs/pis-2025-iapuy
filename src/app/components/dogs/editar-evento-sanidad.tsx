"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import EditarSanidadDialog from "./editar-sanidad-dialog";

type Props = {
  readonly id: string;
  readonly type: string;
  readonly disabled: boolean;
  readonly onEdited?: () => void;
};

export default function EditarEventoSanidad({
  id,
  type,
  disabled,
  onEdited,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEdited = () => {
    if (onEdited) {
      onEdited();
    }
    // Reload to refresh the list
    globalThis.location.reload();
  };

  return (
    <>
      <div
        title={disabled ? "No se puede editar porque ya se pagó" : ""}
        className="text-green-500 hover:text-green-700"
      >
        <button
          disabled={disabled}
          className={`shrink-0 p-1 ${
            disabled ? "disabled:opacity-50 disabled:cursor-not-allowed" : ""
          }`}
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <Pencil />
        </button>
      </div>

      {isOpen && (
        <EditarSanidadDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          eventoId={id}
          eventType={type}
          onEdited={handleEdited}
        />
      )}
    </>
  );
}
