"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Plus, Trash2 } from "lucide-react";

type Tab = "cronometro" | "temporizador" | "notas" | "tareas";
const TABS: { id: Tab; label: string }[] = [
  { id: "cronometro", label: "Cronómetro" },
  { id: "temporizador", label: "Temporizador" },
  { id: "notas", label: "Notas rápidas" },
  { id: "tareas", label: "Lista de tareas" }
];

function formatMs(ms: number): string {
  const totalCentis = Math.floor(ms / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centis)}`
    : `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
}

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now() - elapsed;
    const interval = setInterval(() => setElapsed(Date.now() - startRef.current), 10);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-mono text-5xl font-semibold tabular-nums">{formatMs(elapsed)}</p>
      <div className="flex gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-signal-gradient text-white"
        >
          {running ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setElapsed(0);
            setLaps([]);
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-950/15 dark:border-white/15"
        >
          <RotateCcw size={20} />
        </button>
        {running && (
          <button onClick={() => setLaps((l) => [elapsed, ...l])} className="chip">
            Vuelta
          </button>
        )}
      </div>
      {laps.length > 0 && (
        <ul className="w-full max-w-xs space-y-1 text-sm">
          {laps.map((lap, i) => (
            <li key={i} className="flex justify-between rounded-lg bg-ink-950/5 px-3 py-1.5 font-mono dark:bg-white/10">
              <span>Vuelta {laps.length - i}</span>
              <span>{formatMs(lap)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Countdown() {
  const [minutesInput, setMinutesInput] = useState("5");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining === null) return;
    if (remaining <= 0) {
      setRunning(false);
      return;
    }
    const interval = setInterval(() => setRemaining((r) => (r !== null ? r - 1 : r)), 1000);
    return () => clearInterval(interval);
  }, [running, remaining]);

  function start() {
    const mins = parseFloat(minutesInput);
    if (!mins || mins <= 0) return;
    setRemaining(Math.round(mins * 60));
    setRunning(true);
  }

  const minutes = remaining !== null ? Math.floor(remaining / 60) : 0;
  const seconds = remaining !== null ? remaining % 60 : 0;
  const finished = remaining === 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {remaining === null ? (
        <div className="flex items-end gap-2">
          <div>
            <label className="text-sm font-medium">Minutos</label>
            <input
              type="number"
              value={minutesInput}
              onChange={(e) => setMinutesInput(e.target.value)}
              className="mt-1.5 w-32 rounded-lg border border-ink-950/15 bg-paper-50 px-3.5 py-2.5 text-center text-sm dark:border-white/15 dark:bg-ink-950"
            />
          </div>
          <button onClick={start} className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white">
            Iniciar
          </button>
        </div>
      ) : (
        <>
          <p className={`font-mono text-5xl font-semibold tabular-nums ${finished ? "text-red-500" : ""}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </p>
          {finished && <p className="text-sm font-medium text-red-500">¡Tiempo cumplido!</p>}
          <div className="flex gap-3">
            <button
              onClick={() => setRunning((r) => !r)}
              disabled={finished}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-signal-gradient text-white disabled:opacity-50"
            >
              {running ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button
              onClick={() => {
                setRunning(false);
                setRemaining(null);
              }}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-ink-950/15 dark:border-white/15"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function QuickNotes() {
  const [note, setNote] = useState("");
  return (
    <div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Escribí acá — se mantiene mientras la pestaña siga abierta."
        rows={10}
        className="w-full rounded-xl2 border border-ink-950/15 bg-paper-50 p-4 text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-950"
      />
      <p className="mt-2 text-xs text-ink-950/45 dark:text-white/45">
        Nota: estas notas viven solo en esta pestaña y se pierden al cerrarla. Para guardarlas entre sesiones hace falta
        una cuenta — es parte del roadmap de autenticación.
      </p>
    </div>
  );
}

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState("");

  function addTodo() {
    if (!draft.trim()) return;
    setTodos((t) => [...t, { id: crypto.randomUUID(), text: draft.trim(), done: false }]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Agregar una tarea…"
          className="flex-1 rounded-full border border-ink-950/15 bg-paper-50 px-4 py-2.5 text-sm dark:border-white/15 dark:bg-ink-950"
        />
        <button onClick={addTodo} className="flex h-11 w-11 items-center justify-center rounded-full bg-signal-gradient text-white">
          <Plus size={18} />
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 rounded-lg border border-ink-950/8 px-4 py-2.5 dark:border-white/8"
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => setTodos((t) => t.map((x) => (x.id === todo.id ? { ...x, done: !x.done } : x)))}
              className="accent-signal-violet"
            />
            <span className={`flex-1 text-sm ${todo.done ? "text-ink-950/40 line-through dark:text-white/40" : ""}`}>
              {todo.text}
            </span>
            <button
              onClick={() => setTodos((t) => t.filter((x) => x.id !== todo.id))}
              aria-label="Eliminar tarea"
              className="text-ink-950/30 hover:text-red-500 dark:text-white/30"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
        {todos.length === 0 && <p className="text-sm text-ink-950/40 dark:text-white/40">Sin tareas todavía.</p>}
      </ul>
    </div>
  );
}

export function ProductivityTools() {
  const [tab, setTab] = useState<Tab>("cronometro");

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

      <div className="mt-8">
        {tab === "cronometro" && <Stopwatch />}
        {tab === "temporizador" && <Countdown />}
        {tab === "notas" && <QuickNotes />}
        {tab === "tareas" && <TodoList />}
      </div>
    </div>
  );
}
