"use client";

import { CircleDollarSign } from "lucide-react";
import { ActionModal } from "@/components/action-modal";
import { Field, inputClass } from "@/components/ui";
import { registerPayment } from "@/app/actions/sales";
import { formatCurrency } from "@/lib/format";

export function RegisterPaymentButton({
  saleId,
  remaining,
}: {
  saleId: string;
  remaining: number;
}) {
  return (
    <ActionModal
      trigger={
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">
          <CircleDollarSign className="h-3.5 w-3.5" />
          Registrar pagamento
        </button>
      }
      title="Registrar pagamento"
      description={`Saldo devedor: ${formatCurrency(remaining)}`}
      submitLabel="Confirmar"
      action={(formData) => registerPayment(saleId, formData)}
    >
      <Field label="Valor pago (R$)" htmlFor="amount">
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          max={remaining}
          required
          defaultValue={remaining.toFixed(2)}
          className={inputClass}
        />
      </Field>
      <Field label="Forma de pagamento" htmlFor="method">
        <select id="method" name="method" required className={inputClass}>
          <option value="DINHEIRO">Dinheiro</option>
          <option value="CARTAO">Cartão</option>
          <option value="PIX">Pix</option>
          <option value="OUTRO">Outro</option>
        </select>
      </Field>
    </ActionModal>
  );
}
