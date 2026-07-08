"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/format";

type Item = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export function SaleDetailsToggle({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        {open ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        {items.length} item(ns)
      </button>
      {open && (
        <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.quantity}x {item.productName}
              </span>
              <span className="font-medium text-slate-800">
                {formatCurrency(item.subtotal)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
