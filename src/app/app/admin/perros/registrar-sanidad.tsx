"use client";

import React from "react";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import PerroSanidadFormDialog from "@/components/perro-sanidad-form-dialog";

export default function RegistroSanidad() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="font-sans">
      <Button
        onClick={() => {
          setOpen(true);
        }}
        className="
                      !text-sm !leading-6 !tracking-normal 
                      !flex !items-center !justify-center !gap-1
                      !bg-[#5B9B40] !text-white !hover:bg-[#4b8034]
                      !rounded-md !h-10
                      !w-auto"
      >
        <HeartPulse size={16} />
        Registrar Sanidad
      </Button>

      <PerroSanidadFormDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
