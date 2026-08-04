"use client";

import { useMemo, useState } from "react";

type Tab = "edad" | "imc" | "porcentaje" | "descuento" | "propina" | "interes";
const TABS: { id: Tab; label: string }[] = [
  { id: "edad", label: "Edad" },
  { id: "imc", label: "IMC" },
  { id: "porcentaje", label: "Porcentaje" },
  { id: "descuento", label: "Descuento / IVA" },
  { id: "propina", label: "Propina" },
  { id: "interes", label: "Interés compuesto" }
];

function Field({
  label,
  value,
  onChange,
  type = "number",
  suffix
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2.5 text-sm dark:border-white/15 dark:bg-ink-950"
        />
        {suffix && <span className="text-sm text-ink-950/50 dark:text-white/50">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl2 border border-ink-950/8 bg-paper-50 p-5 text-center dark:border-white/8 dark:bg-ink-950">
      <p className="font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-ink-950/50 dark:text-white/50">{label}</p>
    </div>
  );
}

export function Calculators() {
  const [tab, setTab] = useState<Tab>("edad");

  // Age
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const age = useMemo(() => {
    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years, months, days };
  }, [birthDate]);

  // BMI
  const [weightKg, setWeightKg] = useState("70");
  const [heightCm, setHeightCm] = useState("170");
  const bmi = useMemo(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (!w || !h) return null;
    const value = w / (h * h);
    let category = "Peso saludable";
    if (value < 18.5) category = "Bajo peso";
    else if (value >= 25 && value < 30) category = "Sobrepeso";
    else if (value >= 30) category = "Obesidad";
    return { value, category };
  }, [weightKg, heightCm]);

  // Percentage
  const [pctBase, setPctBase] = useState("200");
  const [pctValue, setPctValue] = useState("15");
  const pctOfBase = (parseFloat(pctBase) * parseFloat(pctValue)) / 100;
  const [numA, setNumA] = useState("50");
  const [numB, setNumB] = useState("200");
  const whatPercent = (parseFloat(numA) / parseFloat(numB)) * 100;

  // Discount / VAT
  const [price, setPrice] = useState("1000");
  const [discountPct, setDiscountPct] = useState("20");
  const [vatPct, setVatPct] = useState("21");
  const discounted = parseFloat(price) * (1 - parseFloat(discountPct) / 100);
  const withVat = parseFloat(price) * (1 + parseFloat(vatPct) / 100);

  // Tip
  const [billAmount, setBillAmount] = useState("1000");
  const [tipPct, setTipPct] = useState("10");
  const [splitBetween, setSplitBetween] = useState("1");
  const tipAmount = (parseFloat(billAmount) * parseFloat(tipPct)) / 100;
  const totalWithTip = parseFloat(billAmount) + tipAmount;
  const perPerson = totalWithTip / Math.max(1, parseFloat(splitBetween) || 1);

  // Compound interest
  const [principal, setPrincipal] = useState("1000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");
  const [contributions, setContributions] = useState("0");
  const compound = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = parseFloat(years) || 0;
    const monthly = parseFloat(contributions) || 0;
    let total = p;
    for (let year = 0; year < n; year++) {
      for (let month = 0; month < 12; month++) {
        total = total * (1 + r / 12) + monthly;
      }
    }
    const totalContributed = p + monthly * 12 * n;
    return { total, interestEarned: total - totalContributed };
  }, [principal, rate, years, contributions]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-ink-950/8 pb-4 dark:border-white/8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-signal-gradient text-white"
                : "bg-ink-950/5 text-ink-950/70 hover:bg-ink-950/10 dark:bg-white/10 dark:text-white/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "edad" && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Fecha de nacimiento" value={birthDate} onChange={setBirthDate} type="date" />
          {age && (
            <ResultCard label="Edad exacta" value={`${age.years}a ${age.months}m ${age.days}d`} />
          )}
        </div>
      )}

      {tab === "imc" && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <Field label="Peso" value={weightKg} onChange={setWeightKg} suffix="kg" />
            <Field label="Altura" value={heightCm} onChange={setHeightCm} suffix="cm" />
          </div>
          {bmi && <ResultCard label={bmi.category} value={bmi.value.toFixed(1)} />}
        </div>
      )}

      {tab === "porcentaje" && (
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-ink-950/70 dark:text-white/70">¿Cuánto es el X% de un número?</p>
            <div className="space-y-4">
              <Field label="Porcentaje" value={pctValue} onChange={setPctValue} suffix="%" />
              <Field label="De" value={pctBase} onChange={setPctBase} />
            </div>
            <div className="mt-4">
              <ResultCard label="Resultado" value={Number.isFinite(pctOfBase) ? pctOfBase.toFixed(2) : "—"} />
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-ink-950/70 dark:text-white/70">¿Qué porcentaje es A de B?</p>
            <div className="space-y-4">
              <Field label="A" value={numA} onChange={setNumA} />
              <Field label="B" value={numB} onChange={setNumB} />
            </div>
            <div className="mt-4">
              <ResultCard label="Porcentaje" value={Number.isFinite(whatPercent) ? `${whatPercent.toFixed(2)}%` : "—"} />
            </div>
          </div>
        </div>
      )}

      {tab === "descuento" && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4 sm:col-span-2">
            <Field label="Precio original" value={price} onChange={setPrice} />
          </div>
          <div>
            <Field label="Descuento" value={discountPct} onChange={setDiscountPct} suffix="%" />
            <div className="mt-4">
              <ResultCard label="Precio con descuento" value={Number.isFinite(discounted) ? discounted.toFixed(2) : "—"} />
            </div>
          </div>
          <div>
            <Field label="IVA / impuesto" value={vatPct} onChange={setVatPct} suffix="%" />
            <div className="mt-4">
              <ResultCard label="Precio con impuesto" value={Number.isFinite(withVat) ? withVat.toFixed(2) : "—"} />
            </div>
          </div>
        </div>
      )}

      {tab === "propina" && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <Field label="Monto de la cuenta" value={billAmount} onChange={setBillAmount} />
            <Field label="Propina" value={tipPct} onChange={setTipPct} suffix="%" />
            <Field label="Dividir entre" value={splitBetween} onChange={setSplitBetween} suffix="personas" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <ResultCard label="Propina" value={tipAmount.toFixed(2)} />
            <ResultCard label="Total con propina" value={totalWithTip.toFixed(2)} />
            <ResultCard label="Por persona" value={perPerson.toFixed(2)} />
          </div>
        </div>
      )}

      {tab === "interes" && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <Field label="Capital inicial" value={principal} onChange={setPrincipal} />
            <Field label="Tasa de interés anual" value={rate} onChange={setRate} suffix="%" />
            <Field label="Años" value={years} onChange={setYears} />
            <Field label="Aporte mensual" value={contributions} onChange={setContributions} />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <ResultCard label="Total final" value={compound.total.toFixed(2)} />
            <ResultCard label="Interés ganado" value={compound.interestEarned.toFixed(2)} />
          </div>
        </div>
      )}
    </div>
  );
}
