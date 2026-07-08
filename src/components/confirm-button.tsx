"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

export function ConfirmButton({
  action,
  confirmMessage,
  className,
  children,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro inesperado.");
      }
    });
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={className}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
