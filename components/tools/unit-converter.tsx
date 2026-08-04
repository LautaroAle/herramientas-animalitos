"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Category = "longitud" | "peso" | "temperatura" | "area" | "volumen" | "tiempo" | "velocidad" | "datos" | "angulos";

interface UnitDef {
  id: string;
  label: string;
  /** Multiplier to convert FROM this unit INTO the category's base unit. Ignored for temperature. */
  toBase: number;
}

const CATEGORIES: { id: Category; label: string; units: UnitDef[] }[] = [
  {
    id: "longitud",
    label: "Longitud",
    units: [
      { id: "mm", label: "Milímetros", toBase: 0.001 },
      { id: "cm", label: "Centímetros", toBase: 0.01 },
      { id: "m", label: "Metros", toBase: 1 },
      { id: "km", label: "Kilómetros", toBase: 1000 },
      { id: "in", label: "Pulgadas", toBase: 0.0254 },
      { id: "ft", label: "Pies", toBase: 0.3048 },
      { id: "yd", label: "Yardas", toBase: 0.9144 },
      { id: "mi", label: "Millas", toBase: 1609.344 }
    ]
  },
  {
    id: "peso",
    label: "Peso",
    units: [
      { id: "mg", label: "Miligramos", toBase: 0.000001 },
      { id: "g", label: "Gramos", toBase: 0.001 },
      { id: "kg", label: "Kilogramos", toBase: 1 },
      { id: "t", label: "Toneladas", toBase: 1000 },
      { id: "oz", label: "Onzas", toBase: 0.0283495 },
      { id: "lb", label: "Libras", toBase: 0.453592 }
    ]
  },
  {
    id: "temperatura",
    label: "Temperatura",
    units: [
      { id: "c", label: "Celsius", toBase: 1 },
      { id: "f", label: "Fahrenheit", toBase: 1 },
      { id: "k", label: "Kelvin", toBase: 1 }
    ]
  },
  {
    id: "area",
    label: "Área",
    units: [
      { id: "m2", label: "Metros²", toBase: 1 },
      { id: "km2", label: "Kilómetros²", toBase: 1_000_000 },
      { id: "ha", label: "Hectáreas", toBase: 10_000 },
      { id: "ft2", label: "Pies²", toBase: 0.092903 },
      { id: "ac", label: "Acres", toBase: 4046.86 }
    ]
  },
  {
    id: "volumen",
    label: "Volumen",
    units: [
      { id: "ml", label: "Mililitros", toBase: 0.001 },
      { id: "l", label: "Litros", toBase: 1 },
      { id: "m3", label: "Metros³", toBase: 1000 },
      { id: "galUS", label: "Galones (US)", toBase: 3.78541 },
      { id: "cup", label: "Tazas", toBase: 0.24 }
    ]
  },
  {
    id: "tiempo",
    label: "Tiempo",
    units: [
      { id: "s", label: "Segundos", toBase: 1 },
      { id: "min", label: "Minutos", toBase: 60 },
      { id: "h", label: "Horas", toBase: 3600 },
      { id: "d", label: "Días", toBase: 86400 },
      { id: "sem", label: "Semanas", toBase: 604800 }
    ]
  },
  {
    id: "velocidad",
    label: "Velocidad",
    units: [
      { id: "ms", label: "Metros/segundo", toBase: 1 },
      { id: "kmh", label: "Kilómetros/hora", toBase: 0.277778 },
      { id: "mph", label: "Millas/hora", toBase: 0.44704 },
      { id: "kn", label: "Nudos", toBase: 0.514444 }
    ]
  },
  {
    id: "datos",
    label: "Datos digitales",
    units: [
      { id: "b", label: "Bits", toBase: 0.125 },
      { id: "B", label: "Bytes", toBase: 1 },
      { id: "KB", label: "Kilobytes", toBase: 1024 },
      { id: "MB", label: "Megabytes", toBase: 1024 ** 2 },
      { id: "GB", label: "Gigabytes", toBase: 1024 ** 3 },
      { id: "TB", label: "Terabytes", toBase: 1024 ** 4 }
    ]
  },
  {
    id: "angulos",
    label: "Ángulos",
    units: [
      { id: "deg", label: "Grados", toBase: 1 },
      { id: "rad", label: "Radianes", toBase: 57.29578 },
      { id: "grad", label: "Gradianes", toBase: 0.9 }
    ]
  }
];

function convertTemperature(value: number, from: string, to: string): number {
  const toCelsius: Record<string, (v: number) => number> = {
    c: (v) => v,
    f: (v) => ((v - 32) * 5) / 9,
    k: (v) => v - 273.15
  };
  const fromCelsius: Record<string, (v: number) => number> = {
    c: (v) => v,
    f: (v) => (v * 9) / 5 + 32,
    k: (v) => v + 273.15
  };
  const toCelsiusFn = toCelsius[from];
  const fromCelsiusFn = fromCelsius[to];
  if (!toCelsiusFn || !fromCelsiusFn) return value;
  return fromCelsiusFn(toCelsiusFn(value));
}

export function UnitConverter() {
  const [category, setCategory] = useState<Category>("longitud");
  const activeCategory = CATEGORIES.find((c) => c.id === category)!;

  const [fromUnit, setFromUnit] = useState(activeCategory.units[0]!.id);
  const [toUnit, setToUnit] = useState(activeCategory.units[1]!.id);
  const [inputValue, setInputValue] = useState("1");

  function selectCategory(next: Category) {
    setCategory(next);
    const cat = CATEGORIES.find((c) => c.id === next)!;
    setFromUnit(cat.units[0]!.id);
    setToUnit(cat.units[1]!.id);
  }

  const result = useMemo(() => {
    const value = parseFloat(inputValue);
    if (Number.isNaN(value)) return null;

    if (category === "temperatura") {
      return convertTemperature(value, fromUnit, toUnit);
    }

    const from = activeCategory.units.find((u) => u.id === fromUnit);
    const to = activeCategory.units.find((u) => u.id === toUnit);
    if (!from || !to) return null;
    return (value * from.toBase) / to.toBase;
  }, [inputValue, fromUnit, toUnit, category, activeCategory]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-ink-950/8 pb-4 dark:border-white/8">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCategory(c.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === c.id
                ? "bg-signal-gradient text-white"
                : "bg-ink-950/5 text-ink-950/70 hover:bg-ink-950/10 dark:bg-white/10 dark:text-white/70"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <label className="text-sm font-medium">De</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2.5 font-mono text-sm dark:border-white/15 dark:bg-ink-950"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
          >
            {activeCategory.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setFromUnit(toUnit);
            setToUnit(fromUnit);
          }}
          aria-label="Invertir unidades"
          className="mb-2 flex h-10 w-10 items-center justify-center justify-self-center rounded-full border border-ink-950/15 dark:border-white/15"
        >
          ⇄
        </button>

        <div>
          <label className="text-sm font-medium">A</label>
          <div className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2.5 font-mono text-sm dark:border-white/15 dark:bg-ink-950">
            {result !== null ? result.toLocaleString("es", { maximumFractionDigits: 6 }) : "—"}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
          >
            {activeCategory.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-6 text-xs text-ink-950/45 dark:text-white/45">
        ¿Buscabas el conversor de monedas?{" "}
        <Link href="/herramientas/moneda" className="font-medium text-signal-violet hover:underline">
          Está acá, con tasas actualizadas
        </Link>
        .
      </p>
    </div>
  );
}
