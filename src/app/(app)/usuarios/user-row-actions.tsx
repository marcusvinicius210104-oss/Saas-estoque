"use client";

import { Pencil, KeyRound, UserX, UserCheck } from "lucide-react";
import { ActionModal } from "@/components/action-modal";
import { ConfirmButton } from "@/components/confirm-button";
import { Field, inputClass } from "@/components/ui";
import {
  resetUserPassword,
  toggleUserActive,
  updateUser,
} from "@/app/actions/users";

type UserRow = {
  id: string;
  name: string;
  role: "ADMIN" | "VENDEDOR";
  active: boolean;
};

const iconButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900";

export function UserRowActions({
  user,
  isSelf,
}: {
  user: UserRow;
  isSelf: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <ActionModal
        trigger={
          <button className={iconButtonClass} title="Editar usuário">
            <Pencil className="h-4 w-4" />
          </button>
        }
        title="Editar usuário"
        submitLabel="Salvar"
        action={(formData) => updateUser(user.id, formData)}
      >
        <Field label="Nome" htmlFor="name">
          <input
            id="name"
            name="name"
            required
            defaultValue={user.name}
            className={inputClass}
          />
        </Field>
        <Field label="Perfil" htmlFor="role">
          <select
            id="role"
            name="role"
            required
            defaultValue={user.role}
            disabled={isSelf}
            className={inputClass}
          >
            <option value="VENDEDOR">Vendedor</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </Field>
      </ActionModal>

      <ActionModal
        trigger={
          <button className={iconButtonClass} title="Redefinir senha">
            <KeyRound className="h-4 w-4" />
          </button>
        }
        title={`Redefinir senha de ${user.name}`}
        submitLabel="Redefinir"
        action={(formData) => resetUserPassword(user.id, formData)}
      >
        <Field label="Nova senha" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            className={inputClass}
          />
        </Field>
      </ActionModal>

      {!isSelf && (
        <ConfirmButton
          action={() => toggleUserActive(user.id, !user.active)}
          confirmMessage={
            user.active
              ? `Desativar o acesso de ${user.name}?`
              : `Reativar o acesso de ${user.name}?`
          }
          className={`${iconButtonClass} ${
            user.active
              ? "hover:bg-red-50 hover:text-red-600"
              : "hover:bg-emerald-50 hover:text-emerald-600"
          }`}
        >
          {user.active ? (
            <UserX className="h-4 w-4" />
          ) : (
            <UserCheck className="h-4 w-4" />
          )}
        </ConfirmButton>
      )}
    </div>
  );
}
