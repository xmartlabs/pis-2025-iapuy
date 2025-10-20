"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type Option = { value: string; label: string }

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  /** Texto del CTA (ej. "+ Agregar perro") */
  createLabel?: string
  /** Ruta a navegar (ej. "/perros/nuevo") */
  createHref?: string
  /** Alternativa a createHref si querés manejarlo afuera */
  onCreate?: () => void
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Seleccione...",
  emptyText = "No se encontró",
  className,
  disabled = false,
  createLabel,
  createHref,
  onCreate,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const router = useRouter()

  const setOpenSafe = (v: boolean) => { if (!disabled) setOpen(v) }

  const handleSelect = React.useCallback(
    (value: string) => {
      if (disabled) return
      const updatedSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
      onChange(updatedSelected)
    },
    [disabled, selected, onChange],
  )

  const handleCreate = React.useCallback(() => {
    if (disabled) return
    setOpen(false)
    if (onCreate) onCreate()
    else if (createHref) router.push(createHref)
  }, [disabled, createHref, onCreate, router])

  const selectedLabels = React.useMemo(
    () =>
      selected
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean)
        .join(", "),
    [selected, options],
  )

  const filteredOptions = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  return (
    <Popover open={open} onOpenChange={setOpenSafe}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-disabled={disabled}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            disabled && "cursor-not-allowed opacity-60",
            className
          )}
        >
          <span className={cn(
              "truncate",
              selected.length === 0 && "text-gray-500"
            )}
            data-placeholder={selected.length === 0 ? "" : undefined}
          >{selected.length ? selectedLabels : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      {/* mismo ancho que el botón */}
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar..."
            className="h-9"
            disabled={disabled}
            onValueChange={setQuery}
          />

          <CommandList>
            {filteredOptions.length === 0 && <CommandEmpty>{emptyText}</CommandEmpty>}

            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // buscamos por label
                  onSelect={() => { handleSelect(option.value) }}
                  disabled={disabled}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            {(createLabel && (createHref || onCreate)) && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreate}
                    disabled={disabled}
                    value="__create__"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createLabel}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
