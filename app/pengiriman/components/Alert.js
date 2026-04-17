"use client";

import { Button } from "@/components/ui/button";

const styles = {
  success: "border-emerald-200/60 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  error: "border-rose-200/60 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200",
  info: "border-sky-200/60 bg-sky-50 text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200",
};

export default function Alert({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div
      className={`mb-4 flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
        styles[type] ?? styles.success
      }`}
      data-testid="alert"
    >
      <p className="leading-relaxed">{message}</p>
      {onClose && (
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 rounded-full"
          aria-label="Tutup"
        >
          ✕
        </Button>
      )}
    </div>
  );
}
