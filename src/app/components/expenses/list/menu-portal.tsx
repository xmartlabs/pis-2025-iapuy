import { useEffect, useRef, useState } from "react";

export default function MenuPortal({
  pos,
  onClose,
  anchor,
  children,
}: {
  pos: { top: number; left: number };
  onClose: () => void;
  anchor: HTMLElement | null;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [localPos, setLocalPos] = useState<{ top: number; left: number }>(pos);

  useEffect(() => {
    function update() {
      if (anchor) {
        const r = anchor.getBoundingClientRect();
        setLocalPos({
          top: r.bottom + window.scrollY,
          left: r.right + window.scrollX,
        });
      } else {
        setLocalPos(pos);
      }
    }

    update();

    const onScroll = () => {
      update();
    };
    const onResize = () => {
      update();
    };

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    const onDown = (ev: Event) => {
      const el = ref.current;
      if (!el) return;
      const target = ev.target as unknown as Node | null;
      if (target && el.contains(target)) return;
      if (anchor && target && anchor.contains(target)) return;
      onClose();
    };

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" || ev.key === "Esc") {
        onClose();
      }
    };

    document.addEventListener("mousedown", onDown as EventListener);
    document.addEventListener("touchstart", onDown as EventListener);
    document.addEventListener("keydown", onKey as EventListener);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousedown", onDown as EventListener);
      document.removeEventListener("touchstart", onDown as EventListener);
      document.removeEventListener("keydown", onKey as EventListener);
    };
  }, [anchor, onClose, pos]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Opciones de gasto"
      tabIndex={0}
      className="z-50 bg-white border border-[2px] rounded-md w-40 py-1"
      style={{
        position: "absolute",
        top: localPos.top + 4,
        left: localPos.left + 10,
        transform: "translateX(-100%)",
      }}
      onClick={(ev) => {
        ev.stopPropagation();
      }}
      onKeyDown={(ev) => {
        if (ev.key === "Escape" || ev.key === "Esc") {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}
