"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Ingresá un correo válido")
});
type FormValues = z.infer<typeof schema>;

export function ComingSoonForm({ toolSlug }: { toolSlug: string }) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    // Wired to /api/waitlist, which validates + rate-limits + persists.
    // See app/api/waitlist/route.ts.
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email, toolSlug })
    });
    if (response.ok) setSubmitted(true);
  }

  if (submitted) {
    return <p className="mt-6 text-sm font-medium text-signal-violet">¡Listo! Te avisamos por correo apenas esté disponible.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex w-full max-w-sm flex-col gap-2 sm:flex-row" noValidate>
      <div className="flex-1">
        <label htmlFor="email" className="sr-only">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="tu@correo.com"
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="w-full rounded-full border border-ink-950/15 bg-white px-4 py-2.5 text-sm outline-none focus-visible:border-signal-violet dark:border-white/15 dark:bg-ink-900"
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-left text-xs text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-signal-gradient px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isSubmitting ? "Enviando…" : "Avisarme"}
      </button>
    </form>
  );
}
