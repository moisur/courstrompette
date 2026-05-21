"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getUrssafVoieTypeLabel, URSSAF_VOIE_TYPES, type UrssafVoieType } from "@/lib/urssaf/voie-types";

interface VoieTypeComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function VoieTypeCombobox({ value, onChange, onBlur, placeholder = "Rechercher un type..." }: VoieTypeComboboxProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedLabel = getUrssafVoieTypeLabel(value);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const filteredOptions = useMemo(() => {
    const search = normalizeSearch(query);

    if (!search) {
      return URSSAF_VOIE_TYPES;
    }

    return URSSAF_VOIE_TYPES.filter((item) => {
      const optionText = normalizeSearch(`${item.code} ${item.label}`);
      return optionText.includes(search);
    });
  }, [query]);

  function selectOption(option: UrssafVoieType) {
    onChange(option.code);
    setQuery("");
    setOpen(false);
  }

  function handleBlur() {
    const search = normalizeSearch(query);
    const exactMatch = URSSAF_VOIE_TYPES.find((item) => {
      return normalizeSearch(item.code) === search || normalizeSearch(item.label) === search;
    });

    if (exactMatch) {
      onChange(exactMatch.code);
    }

    onBlur?.();
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={open ? query : selectedLabel}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="rounded-xl border-stone-200 pr-16"
        autoComplete="off"
      />
      {value ? (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            onChange("");
            setQuery("");
            setOpen(false);
          }}
          className="absolute right-9 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label="Effacer le type de voie"
        >
          <X size={14} />
        </button>
      ) : null}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

      {open ? (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-stone-200 bg-white p-1 shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.code}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-100",
                  option.code === value ? "bg-stone-100 font-bold text-stone-900" : "text-stone-700",
                )}
              >
                <span>
                  <span className="font-mono text-xs font-bold text-stone-500">{option.code}</span>
                  <span className="ml-2">{option.label}</span>
                </span>
                {option.code === value ? <Check size={14} className="text-blue-600" /> : null}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-stone-500">Aucun type de voie trouve.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
