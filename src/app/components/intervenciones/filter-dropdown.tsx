"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Funnel } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  statuses: string[];
  initialStartDate?: string | null;
  yearOptions?: string[];
  initialSelectedStatuses?: string[];
  onSelectionChangeAction?: (
    startDate: string | null,
    endDate: string | null,
    statuses: string[]
  ) => void;
};

const CheckboxRow: React.FC<{
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ label, checked, onCheckedChange }) => (
  <label className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 px-1">
    <Checkbox
      checked={checked}
      onCheckedChange={(val) => {
        onCheckedChange(Boolean(val));
      }}
      className="form-checkbox rounded border-[#5B9B40] bordrer-1"
    />
    <span className="text-gray-900 text-sm">{label}</span>
  </label>
);

export default function FilterDropdown({
  statuses,
  initialStartDate,
  initialSelectedStatuses,
  onSelectionChangeAction,
  yearOptions: propYearOptions,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const parseDateToParts = (d: string | undefined | null) => {
    if (!d) return { month: "", year: "" };
    const parts = d.split("-");
    if (parts.length >= 2) {
      const year = parts[0];
      const month = parts[1];
      return { month: month.padStart(2, "0"), year };
    }
    return { month: "", year: "" };
  };

  const initStart = parseDateToParts(initialStartDate ?? null);

  const [localStartMonth, setLocalStartMonth] = useState<string>(
    initStart.month
  );
  const [localStartYear, setLocalStartYear] = useState<string>(initStart.year);
  const [localSelectedStatuses, setLocalSelectedStatuses] = useState<string[]>(
    initialSelectedStatuses ?? []
  );

  const monthsList = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const currentYear = new Date().getFullYear();
  const fallbackYearOptions = Array.from({ length: 10 }, (_, i) =>
    String(currentYear - i)
  );
  const yearOptions =
    propYearOptions && propYearOptions.length > 0
      ? propYearOptions
      : fallbackYearOptions;

  useEffect(() => {
    const buildStart = (): string | null => {
      if (!localStartYear || !localStartMonth) return null;
      return `${localStartYear}-${localStartMonth}-01`;
    };

    const buildEnd = (): string | null => {
      if (!localStartYear || !localStartMonth) return null;
      const y = Number(localStartYear);
      const m = Number(localStartMonth);
      if (Number.isNaN(y) || Number.isNaN(m)) return null;
      const lastDay = new Date(y, m, 0).getDate();
      return `${localStartYear}-${localStartMonth}-${String(lastDay).padStart(
        2,
        "0"
      )}`;
    };

    const startDate = buildStart();
    const endDate = buildEnd();

    if (onSelectionChangeAction) {
      onSelectionChangeAction(startDate, endDate, localSelectedStatuses);
    }
  }, [
    localStartMonth,
    localStartYear,
    localSelectedStatuses,
    onSelectionChangeAction,
  ]);

  const setStatusChecked = (status: string, checked: boolean) => {
    setLocalSelectedStatuses((prev) =>
      checked
        ? prev.includes(status)
          ? prev
          : [...prev, status]
        : prev.filter((s) => s !== status)
    );
  };

  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!isOpen) return;
      const target = e.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <Button
        onClick={() => {
          setIsOpen((v) => !v);
        }}
        className="bg-white text-[#5B9B40] flex items-center justify-center w-10 h-10 border-1 border-[#BDD7B3] rounded-md gap-2 hover:bg-[#5B9B40] hover:text-white hover:border-white transition duration-300 ease-in-out"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        id="filter-button"
      >
        <Funnel className="w-[20px] h-[20px]" />
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[304px] py-2 bg-white border border-[#BDD7B3] rounded-lg z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="filter-button"
        >
          <div className="flex flex-col gap-2 px-2 py-1">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2 w-1/2">
                <label
                  htmlFor="start-month-select"
                  className="text-sm leading-5 medium"
                  style={{ fontFamily: "Archivo" }}
                >
                  Mes
                </label>
                <select
                  id="start-month-select"
                  className="border border-[#D4D4D4] rounded-md px-2 py-3 text-sm"
                  value={localStartMonth}
                  onChange={(e) => {
                    setLocalStartMonth(e.target.value);
                  }}
                >
                  <option value="">Mes</option>
                  {monthsList.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label
                  htmlFor="start-year-select"
                  className="text-sm leading-5 medium"
                  style={{ fontFamily: "Archivo" }}
                >
                  Año
                </label>
                <select
                  id="start-year-select"
                  className="border border-[#D4D4D4] rounded-md px-2 py-3 text-sm"
                  value={localStartYear}
                  onChange={(e) => {
                    setLocalStartYear(e.target.value);
                  }}
                >
                  <option value="">Año</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end"></div>
          </div>

          <hr className="my-2 border-[#BDD7B3]" />

          <div className="p-2">
            <span
              className="font-semibold text-sm pb-2 pl-1 leading-5"
              style={{ fontFamily: "Archivo" }}
            >
              Estado
            </span>
            <div className="space-y-1">
              {statuses.map((status) => (
                <CheckboxRow
                  key={status}
                  label={status}
                  checked={localSelectedStatuses.includes(status)}
                  onCheckedChange={(checked) => {
                    setStatusChecked(status, checked);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
