import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { ToolCard } from "@/components/tool-card";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_ICONS, CATEGORY_LABELS, IMPLEMENTED_TOOLS, TOOLS, type ToolCategory } from "@/lib/tools-registry";
import { Zap, ShieldCheck, Infinity as InfinityIcon, Gauge } from "lucide-react";

const CATEGORIES: ToolCategory[] = [
  "texto", "qr", "seguridad", "colores", "conversores", "calculadoras", "productividad",
  "pdf", "imagenes", "video", "desarrollo", "documentos", "investigacion", "facturas", "codigo-barras", "traduccion", "cv", "email"
];

const BENEFITS = [
  { icon: Zap, title: "Rápido de verdad", body: "Entra, usa la herramienta y obtén tu resultado en menos de un minuto." },
  { icon: ShieldCheck, title: "Privado por diseño", body: "Las herramientas de texto, colores, QR y seguridad procesan todo en tu navegador: nada se sube a un servidor." },
  { icon: InfinityIcon, title: "Sin registro, sin límites", body: "No necesitas cuenta ni tarjeta para usar ninguna herramienta gratuita." },
  { icon: Gauge, title: "Hecho para durar", body: "Arquitectura modular pensada para sumar cientos de herramientas sin rehacer la plataforma." }
];

const FAQ = [
  { q: "¿Necesito crear una cuenta?", a: "No. Todas las herramientas gratuitas funcionan sin registro. Solo las funciones que guardan proyectos, como el constructor de CV, pedirán una cuenta." },
  { q: "¿Mis archivos y textos quedan guardados en algún servidor?", a: "Las herramientas de texto, colores, QR, seguridad, conversores y calculadoras procesan todo directamente en tu navegador: no viaja nada a un servidor." },
  { q: "¿Por qué algunas herramientas dicen “Próximamente”?", a: "Esas herramientas dependen de servicios externos (conversión de documentos, IA de imágenes, traducción) que requieren infraestructura adicional. La arquitectura ya está lista para sumarlas." },
  { q: "¿Tiene costo alguna herramienta?", a: "El núcleo de la plataforma es y seguirá siendo gratuito. En el futuro habrá un plan Pro opcional con límites más altos para tareas pesadas." }
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-20 md:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 h-[480px] bg-signal-gradient opacity-[0.12] blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 bg-white px-4 py-1.5 text-xs font-medium text-ink-950/70 shadow-soft dark:border-white/10 dark:bg-ink-900 dark:text-white/70">
            +{TOOLS.length} herramientas · gratis · sin registro
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
            Una herramienta para cada tarea.
            <br />
            <span className="bg-signal-gradient bg-clip-text text-transparent">Cero fricción.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-950/60 md:text-lg dark:text-white/60">
            PDF, imágenes, QR, contraseñas, colores, conversores y más — todo bajo una misma
            identidad, listo para usar en el momento en que lo necesitás.
          </p>

          <div className="mt-8 flex justify-center">
            <SearchBar />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-ink-950/50 dark:text-white/50">
            <span>Prueba con:</span>
            {["unir pdf", "quitar fondo", "imc", "contraseña segura"].map((example) => (
              <span key={example} className="rounded-full bg-ink-950/5 px-2.5 py-1 dark:bg-white/10">
                {example}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-semibold">Explora por categoría</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/herramientas?categoria=${category}`}
                className="flex flex-col items-center gap-2 rounded-xl2 border border-ink-950/8 bg-white p-4 text-center shadow-soft transition-transform hover:-translate-y-0.5 dark:border-white/8 dark:bg-ink-900 dark:shadow-soft-dark"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-gradient text-white">
                  <Icon name={CATEGORY_ICONS[category]} size={18} />
                </span>
                <span className="text-xs font-medium">{CATEGORY_LABELS[category]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular tools (fully implemented ones) */}
      <section id="populares" className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold">Herramientas populares</h2>
            <Link href="/herramientas" className="text-sm font-medium text-signal-violet hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {IMPLEMENTED_TOOLS.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 rounded-xl2 bg-ink-950 px-8 py-10 text-white md:grid-cols-4 dark:bg-white/5">
          {[
            { value: `${TOOLS.length}+`, label: "Herramientas planificadas" },
            { value: `${IMPLEMENTED_TOOLS.length}`, label: "Listas para usar hoy" },
            { value: "0", label: "Registros necesarios" },
            { value: "<1 min", label: "Tiempo típico de uso" }
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-sm text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-semibold">Por qué esta plataforma</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ icon: BenefitIcon, title, body }) => (
              <div key={title} className="rounded-xl2 border border-ink-950/8 bg-white p-5 dark:border-white/8 dark:bg-ink-900">
                <BenefitIcon size={22} className="text-signal-violet" />
                <p className="mt-3 font-display font-semibold">{title}</p>
                <p className="mt-1.5 text-sm text-ink-950/60 dark:text-white/60">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-semibold">Preguntas frecuentes</h2>
          <div className="mt-6 divide-y divide-ink-950/8 rounded-xl2 border border-ink-950/8 bg-white dark:divide-white/8 dark:border-white/8 dark:bg-ink-900">
            {FAQ.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="cursor-pointer list-none font-medium marker:content-none">
                  <span className="flex items-center justify-between">
                    {item.q}
                    <span className="ml-4 text-ink-950/40 transition-transform group-open:rotate-45 dark:text-white/40">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-950/60 dark:text-white/60">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
