"use client";

import { Plus } from "lucide-react";
import { ActionModal } from "@/components/action-modal";
import { createProduct } from "@/app/actions/products";
import { ProductFormFields } from "./product-form-fields";

export function NewProductButton() {
  return (
    <ActionModal
      trigger={
        <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Novo produto
        </button>
      }
      title="Novo produto"
      description="Cadastre um produto e seu estoque inicial."
      submitLabel="Cadastrar"
      action={createProduct}
    >
      <ProductFormFields includeQuantity />
    </ActionModal>
  );
}
