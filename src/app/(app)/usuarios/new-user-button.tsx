"use client";

import { Plus } from "lucide-react";
import { ActionModal } from "@/components/action-modal";
import { Field, inputClass } from "@/components/ui";
import { createUser } from "@/app/actions/users";

export function NewUserButton() {
  return (
    <ActionModal
      trigger={
        <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Novo vendedor
        </button>
      }
      title="Novo usuário"
      description="Crie um acesso para você ou um vendedor."
      submitLabel="Criar acesso"
      action={createUser}
    >
      <Field label="Nome" htmlFor="name">
        <input id="name" name="name" required className={inputClass} />
      </Field>
      <Field label="E-mail" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClass}
        />
      </Field>
      <Field label="Senha" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
          className={inputClass}
        />
      </Field>
      <Field label="Perfil" htmlFor="role">
        <select id="role" name="role" required defaultValue="VENDEDOR" className={inputClass}>
          <option value="VENDEDOR">Vendedor</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </Field>
    </ActionModal>
  );
}
