"use client";

import { Pencil, Trash2 } from "lucide-react";
import { ActionModal } from "@/components/action-modal";
import { ConfirmButton } from "@/components/confirm-button";
import { Field, inputClass } from "@/components/ui";
import { deleteCustomer, updateCustomer } from "@/app/actions/customers";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  document: string | null;
  address: string | null;
};

const iconButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900";

export function CustomerRowActions({ customer }: { customer: Customer }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <ActionModal
        trigger={
          <button className={iconButtonClass} title="Editar cliente">
            <Pencil className="h-4 w-4" />
          </button>
        }
        title="Editar cliente"
        submitLabel="Salvar"
        action={(formData) => updateCustomer(customer.id, formData)}
      >
        <Field label="Nome" htmlFor="name">
          <input
            id="name"
            name="name"
            required
            defaultValue={customer.name}
            className={inputClass}
          />
        </Field>
        <Field label="Telefone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            defaultValue={customer.phone ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="CPF/CNPJ" htmlFor="document">
          <input
            id="document"
            name="document"
            defaultValue={customer.document ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Endereço" htmlFor="address">
          <input
            id="address"
            name="address"
            defaultValue={customer.address ?? ""}
            className={inputClass}
          />
        </Field>
      </ActionModal>

      <ConfirmButton
        action={() => deleteCustomer(customer.id)}
        confirmMessage={`Excluir o cliente "${customer.name}"?`}
        className={`${iconButtonClass} hover:bg-red-50 hover:text-red-600`}
      >
        <Trash2 className="h-4 w-4" />
      </ConfirmButton>
    </div>
  );
}
