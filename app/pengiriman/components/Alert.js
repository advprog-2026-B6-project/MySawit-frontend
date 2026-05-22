"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const styles = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

export default function Alert({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div
      className={`mb-4 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
        styles[type] ?? styles.success
      }`}
      data-testid="alert"
    >
      <p className="leading-relaxed">{message}</p>
      {onClose ? (
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 rounded-full"
          aria-label="Tutup"
        >
          <X className="size-3" />
        </Button>
      ) : null}
    </div>
  );
}
