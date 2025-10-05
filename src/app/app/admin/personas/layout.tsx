"use client";

import { Toaster } from "@/components/ui/sonner";

export default function PersonasLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      {children}
      <Toaster />
    </section>
  );
}
