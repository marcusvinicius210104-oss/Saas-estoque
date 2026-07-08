"use client";

import { Plus } from "lucide-react";
import { ActionModal } from "@/components/action-modal";
import { Field, inputClass } from "@/components/ui";
import { createCustomer } from "@/app/actions/customers";

export function NewCustomerButton() {
  return (
    <ActionModal
      trigger={
        <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Novo cliente
        </button>
      }
      title="Novo cliente"
      submitLabel="Cadastrar"
      action={createCustomer}
    >
      <Field label="Nome" htmlFor="name">
        <input id="name" name="name" required className={inputClass} />
      </Field>
      <Field label="Telefone" htmlFor="phone">
        <input id="phone" name="phone" className={inputClass} placeholder="Opcional" />
      </Field>
      <Field label="CPF/CNPJ" htmlFor="document">
        <input id="document" name="document" className={inputClass} placeholder="Opcional" />
      </Field>
      <Field label="Endereço" htmlFor="address">
        <input id="address" name="address" className={inputClass} placeholder="Opcional" />
      </Field>
    </ActionModal>
  );
}
