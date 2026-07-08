import { Field, inputClass } from "@/components/ui";

export function ProductFormFields({
  defaults,
  includeQuantity = false,
}: {
  defaults?: {
    name: string;
    sku: string;
    category: string | null;
    costPrice: number;
    salePrice: number;
    minStock: number;
  };
  includeQuantity?: boolean;
}) {
  return (
    <>
      <Field label="Nome do produto" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          defaultValue={defaults?.name}
          className={inputClass}
          placeholder="Ex.: Camiseta Polo Azul M"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Código (SKU)" htmlFor="sku">
          <input
            id="sku"
            name="sku"
            required
            defaultValue={defaults?.sku}
            className={inputClass}
            placeholder="Ex.: CAM-AZ-M"
          />
        </Field>
        <Field label="Categoria" htmlFor="category">
          <input
            id="category"
            name="category"
            defaultValue={defaults?.category ?? ""}
            className={inputClass}
            placeholder="Opcional"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço de custo (R$)" htmlFor="costPrice">
          <input
            id="costPrice"
            name="costPrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaults?.costPrice}
            className={inputClass}
          />
        </Field>
        <Field label="Preço de venda (R$)" htmlFor="salePrice">
          <input
            id="salePrice"
            name="salePrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaults?.salePrice}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {includeQuantity && (
          <Field label="Quantidade inicial" htmlFor="quantity">
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              step="1"
              defaultValue={0}
              className={inputClass}
            />
          </Field>
        )}
        <Field label="Estoque mínimo" htmlFor="minStock">
          <input
            id="minStock"
            name="minStock"
            type="number"
            min="0"
            step="1"
            defaultValue={defaults?.minStock ?? 0}
            className={inputClass}
          />
        </Field>
      </div>
    </>
  );
}
