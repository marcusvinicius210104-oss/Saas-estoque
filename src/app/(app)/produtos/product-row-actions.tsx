"use client";

import { Pencil, PackagePlus, Trash2 } from "lucide-react";
import { ActionModal } from "@/components/action-modal";
import { ConfirmButton } from "@/components/confirm-button";
import { Field, inputClass } from "@/components/ui";
import {
  adjustStock,
  deleteProduct,
  updateProduct,
} from "@/app/actions/products";
import { ProductFormFields } from "./product-form-fields";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  costPrice: number;
  salePrice: number;
  minStock: number;
};

const iconButtonClass =
  "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900";

export function ProductRowActions({ product }: { product: Product }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <ActionModal
        trigger={
          <button className={iconButtonClass} title="Movimentar estoque">
            <PackagePlus className="h-4 w-4" />
          </button>
        }
        title={`Movimentar estoque - ${product.name}`}
        description="Registre entradas, saídas ou ajustes de estoque."
        submitLabel="Registrar"
        action={(formData) => adjustStock(product.id, formData)}
      >
        <Field label="Tipo de movimentação" htmlFor="type">
          <select id="type" name="type" required className={inputClass}>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
            <option value="AJUSTE">Ajuste (correção)</option>
          </select>
        </Field>
        <Field label="Quantidade" htmlFor="quantity">
          <input
            id="quantity"
            name="quantity"
            type="number"
            step="1"
            required
            className={inputClass}
            placeholder="Ex.: 10 (use negativo apenas em ajuste)"
          />
        </Field>
        <Field label="Observação" htmlFor="note">
          <input
            id="note"
            name="note"
            className={inputClass}
            placeholder="Opcional"
          />
        </Field>
      </ActionModal>

      <ActionModal
        trigger={
          <button className={iconButtonClass} title="Editar produto">
            <Pencil className="h-4 w-4" />
          </button>
        }
        title="Editar produto"
        submitLabel="Salvar"
        action={(formData) => updateProduct(product.id, formData)}
      >
        <ProductFormFields defaults={product} />
      </ActionModal>

      <ConfirmButton
        action={() => deleteProduct(product.id)}
        confirmMessage={`Excluir o produto "${product.name}"? Essa ação não pode ser desfeita.`}
        className={`${iconButtonClass} hover:bg-red-50 hover:text-red-600`}
      >
        <Trash2 className="h-4 w-4" />
      </ConfirmButton>
    </div>
  );
}
