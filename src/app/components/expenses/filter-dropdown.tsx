"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Funnel } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface pairPerson {
  userId :string;
  nombre : string;
}

type Props = {
  months: string[];
  people: pairPerson[];
  statuses: string[];
  initialSelectedMonths?: string[];
  initialSelectedStatuses?: string[];
  initialSelectedPeople? : string[];
  onSelectionChangeAction?: (months: string[], statuses: string[], people : string[] ) => void;
};

const CheckboxRow: React.FC<{
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ label, checked, onCheckedChange }) => (
  <label className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-50 px-4">
    <Checkbox
      checked={checked}
      onCheckedChange={(val) => {
        // Radix puede enviar true/false or "indeterminate" but here it's boolean
        onCheckedChange(Boolean(val));
      }}
      className="form-checkbox text-blue-600 rounded"
    />
    <span className="text-gray-900 text-sm">{label}</span>
  </label>
);

export default function FilterDropdown({
  months,
  statuses,
  people,
  initialSelectedMonths,
  initialSelectedStatuses,
  initialSelectedPeople,
  onSelectionChangeAction,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const [localSelectedMonths, setLocalSelectedMonths] = useState<string[]>(
    initialSelectedMonths ?? [],
  );
  const [localSelectedStatuses, setLocalSelectedStatuses] = useState<string[]>(
    initialSelectedStatuses ?? [],
  );
  const [localSelectedPeople, setLocalSelectedPeople] = useState<string[]>(
    initialSelectedPeople ?? [],
  );

  useEffect(() => {
    if (onSelectionChangeAction) {
      onSelectionChangeAction(localSelectedMonths, localSelectedStatuses,localSelectedPeople);
    }
  }, [localSelectedMonths, localSelectedStatuses,localSelectedPeople,onSelectionChangeAction]);

  const setMonthChecked = (month: string, checked: boolean) => {
    setLocalSelectedMonths((prev) =>
      checked ? (prev.includes(month) ? prev : [...prev, month]) : prev.filter((m) => m !== month),
    );
  };

  const setStatusChecked = (status: string, checked: boolean) => {
    setLocalSelectedStatuses((prev) =>
      checked ? (prev.includes(status) ? prev : [...prev, status]) : prev.filter((s) => s !== status),
    );
  };

  const setPersonChecked = (person: string, checked: boolean) => {
    setLocalSelectedPeople((prev) =>
      checked ? (prev.includes(person) ? prev : [...prev, person]) : prev.filter((s) => s !== person),
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
        className="bg-white text-black flex items-center justify-center w-11 h-11 border-2 border-[#2D3648] rounded-md gap-2 opacity-100 hover:bg-black hover:text-white hover:border-black transition duration-300 ease-in-out"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        id="filter-button"
      >
        <Funnel className="w-[20px] h-[20px]" />
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 p-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="filter-button"
        >
          <div className="p-2">
            <h3 className="font-bold text-gray-800 text-base pb-2 pl-2">Mes</h3>
            <div className="space-y-1">
              {months.map((month) => (
                <CheckboxRow
                  key={month}
                  label={month}
                  checked={localSelectedMonths.includes(month)}
                  onCheckedChange={(checked) => { setMonthChecked(month, checked); }}
                />
              ))}
            </div>
          </div>

          <hr className="my-2 border-gray-200" />

          <div className="p-2">
            <h3 className="font-bold text-gray-800 text-base pb-2 pl-2">
              Estado
            </h3>
            <div className="space-y-1">
              {statuses.map((status) => (
                <CheckboxRow
                  key={status}
                  label={status}
                  checked={localSelectedStatuses.includes(status)}
                  onCheckedChange={(checked) => { setStatusChecked(status, checked); }}
                />
              ))}
            </div>
          </div>

          <hr className="my-2 border-gray-200" />

          <div className="p-2">
            <h3 className="font-bold text-gray-800 text-base pb-2 pl-2">
              Personas
            </h3>
            <div className="space-y-1">
              {people.map((person) => (
                <CheckboxRow
                  key={person.userId}
                  label={person.nombre}
                  checked={localSelectedPeople.includes(person.userId)}
                  onCheckedChange={(checked) => { setPersonChecked(person.userId, checked); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
