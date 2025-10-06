import { Toaster } from "sonner";

export default function Instituciones({children,}: {children: React.ReactNode;}) {
  return (
    <section>
      {children}
      <Toaster richColors position="bottom-right" />
    </section>
  );
}