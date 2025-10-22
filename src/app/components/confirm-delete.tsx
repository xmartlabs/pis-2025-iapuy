import { Button } from "@/components/ui/button";
import { useState, type ReactNode } from "react";

type ConfirmDeleteProps = {
  handleAction: () => Promise<void>;
  // children is a render-prop that receives an `open` function
  children?: (open: () => void) => ReactNode;
  title?: string;
};

export default function ConfirmDelete({
  handleAction,
  children,
  title,
}: ConfirmDeleteProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
  };

  return (
    <>
      {typeof children === "function" ? children(open) : null}

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-200 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
              onClick={close}
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="flex flex-col">
              <h2
                className="text-lg font-semibold mb-2 text-gray-800"
                style={{ fontFamily: "Archivo, sans-serif" }}
              >
                {title}
              </h2>
              <div className="flex gap-3 w-full justify-between mt-4">
                <Button
                  variant="outline"
                  className="px-6 py-2 rounded-lg font-medium border-gray-300 hover:bg-gray-100 transition text-red-600 sm:h-10"
                  onClick={close}
                >
                  No, cancelar
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow transition sm:h-10"
                  onClick={() => {
                    close();
                    handleAction().catch(() => {});
                  }}
                >
                  Si, eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
