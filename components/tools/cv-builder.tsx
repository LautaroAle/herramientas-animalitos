"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Upload, Download, FileJson, RotateCcw } from "lucide-react";
import { downloadFile, dataUrlToUint8Array } from "@/lib/utils";
import { StatusBanner } from "@/components/tools/tool-shell";
import { useDebouncedValue } from "@/hooks/use-debounce";

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  start: string;
  end: string;
  description: string;
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  start: string;
  end: string;
}

interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

interface CvData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin: string;
  website: string;
  photoDataUrl: string;
  accentColor: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
  languages: LanguageItem[];
}

const STORAGE_KEY = "cv-builder-draft-v1";

const EMPTY_CV: CvData = {
  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  linkedin: "",
  website: "",
  photoDataUrl: "",
  accentColor: "#5B4CF5",
  skills: [],
  experience: [],
  education: [],
  languages: []
};

function loadDraft(): CvData {
  if (typeof window === "undefined") return EMPTY_CV;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY_CV, ...JSON.parse(raw) } : EMPTY_CV;
  } catch {
    return EMPTY_CV;
  }
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-950/60 dark:text-white/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3 py-1.5 text-sm dark:border-white/15 dark:bg-ink-950"
      />
    </div>
  );
}

function hexToRgb01(hex: string): [number, number, number] {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return [0.357, 0.298, 0.961];
  const [, r, g, b] = match;
  return [parseInt(r!, 16) / 255, parseInt(g!, 16) / 255, parseInt(b!, 16) / 255];
}

// ---------------------------------------------------------------------------
// PDF generation — two templates sharing the same text-wrapping approach so
// we always know exactly how many lines a paragraph produced (needed to
// avoid the overlap bug class entirely, instead of guessing offsets).
// ---------------------------------------------------------------------------
async function generateCvPdf(data: CvData, template: "moderna" | "ats") {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const black = rgb(0.07, 0.08, 0.1);
  const gray = rgb(0.4, 0.42, 0.47);

  const [ar, ag, ab] = template === "moderna" ? hexToRgb01(data.accentColor) : [0.07, 0.08, 0.1];
  const accent = rgb(ar, ag, ab);

  function wrapText(text: string, useFont: typeof font, size: number, maxWidth: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (useFont.widthOfTextAtSize(test, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  const pageWidth = 595.28;
  const marginX = 50;
  const contentWidth = pageWidth - marginX * 2;
  let y = 780;

  let photoImage = null;
  if (data.photoDataUrl && template === "moderna") {
    try {
      const bytes = dataUrlToUint8Array(data.photoDataUrl);
      photoImage = data.photoDataUrl.includes("image/png") ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
    } catch {
      photoImage = null;
    }
  }

  const headerTextX = photoImage ? marginX + 76 : marginX;
  if (photoImage) {
    page.drawImage(photoImage, { x: marginX, y: y - 64, width: 64, height: 64 });
  }
  page.drawText(data.fullName || "Tu nombre", { x: headerTextX, y, size: 22, font: bold, color: black });
  y -= 22;
  page.drawText(data.jobTitle || "", { x: headerTextX, y, size: 12, font, color: accent });
  y -= 18;
  const contactLine = [data.email, data.phone, data.location].filter(Boolean).join("   ·   ");
  page.drawText(contactLine, { x: headerTextX, y, size: 9, font, color: gray });
  y -= 12;
  const linksLine = [data.linkedin, data.website].filter(Boolean).join("   ·   ");
  if (linksLine) {
    page.drawText(linksLine, { x: headerTextX, y, size: 9, font, color: gray });
    y -= 12;
  }

  y = Math.min(y, 780 - 64) - 16;
  page.drawLine({ start: { x: marginX, y }, end: { x: pageWidth - marginX, y }, thickness: 1.2, color: accent });
  y -= 24;

  function drawSectionTitle(title: string) {
    page.drawText(title.toUpperCase(), { x: marginX, y, size: 10, font: bold, color: accent });
    y -= 16;
  }

  function drawParagraph(text: string, size = 9.5, width = contentWidth) {
    for (const line of wrapText(text, font, size, width)) {
      if (y < 60) return;
      page.drawText(line, { x: marginX, y, size, font, color: black });
      y -= size + 3.5;
    }
  }

  if (data.summary.trim()) {
    drawSectionTitle("Perfil profesional");
    drawParagraph(data.summary);
    y -= 10;
  }

  if (data.experience.length > 0) {
    drawSectionTitle("Experiencia");
    for (const exp of data.experience) {
      if (y < 80) break;
      page.drawText(exp.role || "Puesto", { x: marginX, y, size: 10.5, font: bold, color: black });
      const dateLabel = [exp.start, exp.end].filter(Boolean).join(" — ");
      if (dateLabel) {
        const dateWidth = font.widthOfTextAtSize(dateLabel, 9);
        page.drawText(dateLabel, { x: pageWidth - marginX - dateWidth, y, size: 9, font, color: gray });
      }
      y -= 13;
      if (exp.company) {
        page.drawText(exp.company, { x: marginX, y, size: 9.5, font, color: accent });
        y -= 13;
      }
      if (exp.description.trim()) drawParagraph(exp.description, 9);
      y -= 10;
    }
  }

  if (data.education.length > 0) {
    drawSectionTitle("Educación");
    for (const edu of data.education) {
      if (y < 60) break;
      page.drawText(edu.degree || "Título", { x: marginX, y, size: 10.5, font: bold, color: black });
      const dateLabel = [edu.start, edu.end].filter(Boolean).join(" — ");
      if (dateLabel) {
        const dateWidth = font.widthOfTextAtSize(dateLabel, 9);
        page.drawText(dateLabel, { x: pageWidth - marginX - dateWidth, y, size: 9, font, color: gray });
      }
      y -= 13;
      if (edu.institution) {
        page.drawText(edu.institution, { x: marginX, y, size: 9.5, font, color: gray });
        y -= 13;
      }
      y -= 8;
    }
  }

  if (data.skills.length > 0 && y > 60) {
    drawSectionTitle("Habilidades");
    drawParagraph(data.skills.join("   ·   "));
    y -= 6;
  }

  if (data.languages.length > 0 && y > 60) {
    drawSectionTitle("Idiomas");
    drawParagraph(data.languages.map((l) => `${l.name} (${l.level})`).join("   ·   "));
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
}

export function CvBuilder() {
  const [data, setData] = useState<CvData>(EMPTY_CV);
  const [template, setTemplate] = useState<"moderna" | "ats">("moderna");
  const [skillInput, setSkillInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saveNote, setSaveNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setData(loadDraft());
  }, []);

  const debouncedData = useDebouncedValue(data, 600);
  useEffect(() => {
    if (debouncedData === EMPTY_CV) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(debouncedData));
    setSaveNote("Guardado en este navegador");
    const timeout = setTimeout(() => setSaveNote(""), 1500);
    return () => clearTimeout(timeout);
  }, [debouncedData]);

  function update<K extends keyof CvData>(key: K, value: CvData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addExperience() {
    update("experience", [...data.experience, { id: crypto.randomUUID(), role: "", company: "", start: "", end: "", description: "" }]);
  }
  function updateExperience(id: string, patch: Partial<ExperienceItem>) {
    update("experience", data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function removeExperience(id: string) {
    update("experience", data.experience.filter((e) => e.id !== id));
  }

  function addEducation() {
    update("education", [...data.education, { id: crypto.randomUUID(), degree: "", institution: "", start: "", end: "" }]);
  }
  function updateEducation(id: string, patch: Partial<EducationItem>) {
    update("education", data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function removeEducation(id: string) {
    update("education", data.education.filter((e) => e.id !== id));
  }

  function addLanguage() {
    update("languages", [...data.languages, { id: crypto.randomUUID(), name: "", level: "Intermedio" }]);
  }
  function updateLanguage(id: string, patch: Partial<LanguageItem>) {
    update("languages", data.languages.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function removeLanguage(id: string) {
    update("languages", data.languages.filter((l) => l.id !== id));
  }

  function addSkill() {
    const value = skillInput.trim();
    if (!value || data.skills.includes(value)) return;
    update("skills", [...data.skills, value]);
    setSkillInput("");
  }

  function handlePhoto(file: File) {
    if (file.size > 1024 * 1024) {
      setError("La foto pesa demasiado. Usá una imagen de menos de 1 MB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => update("photoDataUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleDownloadPdf() {
    setBusy(true);
    setError("");
    try {
      const blob = await generateCvPdf(data, template);
      downloadFile(blob, `cv-${(data.fullName || "curriculum").toLowerCase().replace(/\s+/g, "-")}.pdf`);
    } catch {
      setError("No se pudo generar el PDF.");
    } finally {
      setBusy(false);
    }
  }

  function exportJson() {
    downloadFile(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), "cv-proyecto.json");
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        setData({ ...EMPTY_CV, ...parsed });
      } catch {
        setError("Ese archivo no es un proyecto de CV válido.");
      }
    };
    reader.readAsText(file);
  }

  function resetAll() {
    if (!confirm("¿Borrar todo el contenido del currículum? Esta acción no se puede deshacer.")) return;
    setData(EMPTY_CV);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const previewSkills = useMemo(() => data.skills.join(" · "), [data.skills]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-950/8 pb-4 dark:border-white/8">
        <div className="flex gap-2">
          {([{ id: "moderna", label: "Moderna" }, { id: "ats", label: "ATS / Simple" }] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                template === t.id ? "bg-signal-gradient text-white" : "bg-ink-950/5 text-ink-950/70 dark:bg-white/10 dark:text-white/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {saveNote && <span className="text-xs text-emerald-500">{saveNote}</span>}
          <button onClick={resetAll} className="chip inline-flex items-center gap-1.5">
            <RotateCcw size={13} /> Nuevo
          </button>
          <button onClick={exportJson} className="chip inline-flex items-center gap-1.5">
            <FileJson size={13} /> Guardar proyecto
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="chip inline-flex items-center gap-1.5">
            <Upload size={13} /> Cargar proyecto
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="sr-only" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-950/45 dark:text-white/45">
        {template === "ats"
          ? "El formato ATS omite la foto y las columnas a propósito: los sistemas de selección automática suelen fallar al leerlas, así que este formato prioriza que tu CV pase el filtro."
          : "Se guarda automáticamente en este navegador mientras escribís. Para llevarlo a otra computadora, usá \"Guardar proyecto\" y después \"Cargar proyecto\" ahí."}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-semibold">Datos personales</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nombre completo" value={data.fullName} onChange={(v) => update("fullName", v)} />
              <Field label="Puesto al que aspirás" value={data.jobTitle} onChange={(v) => update("jobTitle", v)} />
              <Field label="Email" value={data.email} onChange={(v) => update("email", v)} type="email" />
              <Field label="Teléfono" value={data.phone} onChange={(v) => update("phone", v)} />
              <Field label="Ubicación" value={data.location} onChange={(v) => update("location", v)} />
              <Field label="LinkedIn" value={data.linkedin} onChange={(v) => update("linkedin", v)} />
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-ink-950/60 dark:text-white/60">Resumen profesional</label>
              <textarea
                value={data.summary}
                onChange={(e) => update("summary", e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
              />
            </div>
            {template === "moderna" && (
              <div className="mt-3 flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-950/20 px-3 py-2 text-sm text-ink-950/60 dark:border-white/20 dark:text-white/60">
                  <Upload size={14} /> {data.photoDataUrl ? "Cambiar foto" : "Subir foto (opcional)"}
                  <input type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
                </label>
                <input type="color" value={data.accentColor} onChange={(e) => update("accentColor", e.target.value)} className="h-9 w-14 cursor-pointer rounded-lg border border-ink-950/15 dark:border-white/15" />
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Experiencia</p>
              <button onClick={addExperience} className="chip inline-flex items-center gap-1.5"><Plus size={13} /> Agregar</button>
            </div>
            <div className="space-y-3">
              {data.experience.map((exp) => (
                <div key={exp.id} className="rounded-lg border border-ink-950/8 p-3 dark:border-white/8">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Field label="Puesto" value={exp.role} onChange={(v) => updateExperience(exp.id, { role: v })} />
                    <Field label="Empresa" value={exp.company} onChange={(v) => updateExperience(exp.id, { company: v })} />
                    <Field label="Inicio" value={exp.start} onChange={(v) => updateExperience(exp.id, { start: v })} placeholder="2022" />
                    <Field label="Fin" value={exp.end} onChange={(v) => updateExperience(exp.id, { end: v })} placeholder="Actualidad" />
                  </div>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                    placeholder="Logros y responsabilidades…"
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-ink-950/15 bg-paper-50 px-3 py-2 text-sm dark:border-white/15 dark:bg-ink-950"
                  />
                  <button onClick={() => removeExperience(exp.id)} className="mt-2 inline-flex items-center gap-1 text-xs text-ink-950/40 hover:text-red-500 dark:text-white/40">
                    <Trash2 size={12} /> Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Educación</p>
              <button onClick={addEducation} className="chip inline-flex items-center gap-1.5"><Plus size={13} /> Agregar</button>
            </div>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="rounded-lg border border-ink-950/8 p-3 dark:border-white/8">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Field label="Título" value={edu.degree} onChange={(v) => updateEducation(edu.id, { degree: v })} />
                    <Field label="Institución" value={edu.institution} onChange={(v) => updateEducation(edu.id, { institution: v })} />
                    <Field label="Inicio" value={edu.start} onChange={(v) => updateEducation(edu.id, { start: v })} />
                    <Field label="Fin" value={edu.end} onChange={(v) => updateEducation(edu.id, { end: v })} />
                  </div>
                  <button onClick={() => removeEducation(edu.id)} className="mt-2 inline-flex items-center gap-1 text-xs text-ink-950/40 hover:text-red-500 dark:text-white/40">
                    <Trash2 size={12} /> Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Habilidades</p>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Ej: Excel, gestión de equipos…"
                className="flex-1 rounded-lg border border-ink-950/15 bg-paper-50 px-3 py-1.5 text-sm dark:border-white/15 dark:bg-ink-950"
              />
              <button onClick={addSkill} className="chip">Agregar</button>
            </div>
            {data.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-ink-950/5 px-2.5 py-1 text-xs dark:bg-white/10">
                    {skill}
                    <button onClick={() => update("skills", data.skills.filter((s) => s !== skill))} aria-label={`Quitar ${skill}`}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Idiomas</p>
              <button onClick={addLanguage} className="chip inline-flex items-center gap-1.5"><Plus size={13} /> Agregar</button>
            </div>
            <div className="space-y-2">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-2">
                  <input value={lang.name} onChange={(e) => updateLanguage(lang.id, { name: e.target.value })} placeholder="Idioma" className="flex-1 rounded-lg border border-ink-950/15 bg-paper-50 px-3 py-1.5 text-sm dark:border-white/15 dark:bg-ink-950" />
                  <select value={lang.level} onChange={(e) => updateLanguage(lang.id, { level: e.target.value })} className="rounded-lg border border-ink-950/15 bg-paper-50 px-2 py-1.5 text-sm dark:border-white/15 dark:bg-ink-950">
                    {["Básico", "Intermedio", "Avanzado", "Nativo"].map((lvl) => <option key={lvl}>{lvl}</option>)}
                  </select>
                  <button onClick={() => removeLanguage(lang.id)} aria-label="Quitar idioma" className="text-ink-950/40 hover:text-red-500 dark:text-white/40"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {error && <StatusBanner kind="error">{error}</StatusBanner>}
          <button onClick={handleDownloadPdf} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-signal-gradient px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50">
            <Download size={15} /> {busy ? "Generando…" : "Descargar CV en PDF"}
          </button>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Vista previa</p>
          <div className="rounded-xl2 border border-ink-950/8 bg-white p-6 text-sm shadow-soft dark:border-white/8 dark:bg-ink-900 dark:shadow-soft-dark" style={{ aspectRatio: "595/842" }}>
            <div className="flex items-start gap-4">
              {template === "moderna" && data.photoDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
                <img src={data.photoDataUrl} alt="Foto" className="h-16 w-16 rounded-full object-cover" />
              )}
              <div>
                <p className="font-display text-lg font-semibold">{data.fullName || "Tu nombre"}</p>
                <p className="text-xs font-medium" style={{ color: template === "moderna" ? data.accentColor : undefined }}>{data.jobTitle}</p>
                <p className="mt-1 text-xs text-ink-950/50 dark:text-white/50">
                  {[data.email, data.phone, data.location].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t pt-3" style={{ borderColor: template === "moderna" ? data.accentColor : "#e5e5e8" }}>
              {data.summary && (
                <>
                  <p className="text-xs font-semibold uppercase text-ink-950/50 dark:text-white/50">Perfil</p>
                  <p className="mt-1 text-xs">{data.summary}</p>
                </>
              )}

              {data.experience.length > 0 && (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase text-ink-950/50 dark:text-white/50">Experiencia</p>
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="mt-1.5">
                      <p className="text-xs font-semibold">{exp.role || "Puesto"} {exp.company && `· ${exp.company}`}</p>
                      <p className="text-[10px] text-ink-950/40 dark:text-white/40">{[exp.start, exp.end].filter(Boolean).join(" — ")}</p>
                    </div>
                  ))}
                </>
              )}

              {data.education.length > 0 && (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase text-ink-950/50 dark:text-white/50">Educación</p>
                  {data.education.map((edu) => (
                    <p key={edu.id} className="mt-1 text-xs">{edu.degree || "Título"} · {edu.institution}</p>
                  ))}
                </>
              )}

              {previewSkills && (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase text-ink-950/50 dark:text-white/50">Habilidades</p>
                  <p className="mt-1 text-xs">{previewSkills}</p>
                </>
              )}
            </div>
          </div>
          <p className="mt-2 text-xs text-ink-950/40 dark:text-white/40">Vista aproximada — el PDF final ajusta automáticamente el salto de línea y el espaciado.</p>
        </div>
      </div>
    </div>
  );
}
