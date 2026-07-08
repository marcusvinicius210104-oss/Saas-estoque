"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, CheckCircle2 } from "lucide-react";
import { Card, Field, inputClass, labelClass } from "@/components/ui";
import { createSale } from "@/app/actions/sales";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  sku: string;
  salePrice: number;
  quantity: number;
};

type Customer = { id: string; name: string };

type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  maxQuantity: number;
};

export function SaleForm({
  products,
  customers,
}: {
  products: Product[];
  customers: Customer[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<"A_VISTA" | "A_PRAZO">(
    "A_VISTA"
  );
  const [method, setMethod] = useState("DINHEIRO");
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return products
      .filter(
        (p) =>
          p.quantity > 0 &&
          (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [search, products]);

  const total = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  function addProduct(product: Product) {
    setSearch("");
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.quantity < item.maxQuantity
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.salePrice,
          maxQuantity: product.quantity,
        },
      ];
    });
  }

  function updateItem(productId: string, patch: Partial<CartItem>) {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, ...patch } : item
      )
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  function resetForm() {
    setCart([]);
    setNotes("");
    setDueDate("");
    setCustomerId("");
  }

  function handleSubmit() {
    setError(null);
    setSuccess(null);

    if (cart.length === 0) {
      setError("Adicione ao menos um produto à venda.");
      return;
    }
    if (paymentType === "A_PRAZO" && (!customerId || !dueDate)) {
      setError("Selecione o cliente e a data de vencimento para venda a prazo.");
      return;
    }

    startTransition(async () => {
      try {
        await createSale({
          paymentType,
          method: paymentType === "A_VISTA" ? (method as never) : undefined,
          customerId: paymentType === "A_PRAZO" ? customerId : undefined,
          dueDate: paymentType === "A_PRAZO" ? dueDate : undefined,
          notes: notes || undefined,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        });
        setSuccess("Venda registrada com sucesso!");
        resetForm();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao registrar venda.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Produtos
        </h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className={`${inputClass} pl-9`}
          />
          {filteredProducts.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span>
                    <span className="font-medium text-slate-900">
                      {product.name}
                    </span>
                    <span className="ml-2 text-xs text-slate-400">
                      {product.sku}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    {product.quantity} un. · {formatCurrency(product.salePrice)}
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 overflow-x-auto">
          {cart.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              Nenhum produto adicionado ainda.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="py-2 font-semibold">Produto</th>
                  <th className="py-2 font-semibold">Qtd.</th>
                  <th className="py-2 font-semibold">Preço unit.</th>
                  <th className="py-2 text-right font-semibold">Subtotal</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <tr key={item.productId}>
                    <td className="py-2 pr-2 font-medium text-slate-900">
                      {item.name}
                      <p className="text-xs font-normal text-slate-400">
                        disponível: {item.maxQuantity}
                      </p>
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min={1}
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(e) => {
                          const value = Math.max(
                            1,
                            Math.min(
                              item.maxQuantity,
                              Number(e.target.value) || 1
                            )
                          );
                          updateItem(item.productId, { quantity: value });
                        }}
                        className={`${inputClass} w-20`}
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.productId, {
                            unitPrice: Number(e.target.value) || 0,
                          })
                        }
                        className={`${inputClass} w-28`}
                      />
                    </td>
                    <td className="py-2 text-right font-semibold text-slate-900">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card className="h-fit p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Pagamento
        </h2>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPaymentType("A_VISTA")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              paymentType === "A_VISTA"
                ? "border-amber-400 bg-amber-50 text-amber-800"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            À vista
          </button>
          <button
            type="button"
            onClick={() => setPaymentType("A_PRAZO")}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              paymentType === "A_PRAZO"
                ? "border-amber-400 bg-amber-50 text-amber-800"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            A prazo
          </button>
        </div>

        {paymentType === "A_VISTA" ? (
          <Field label="Forma de pagamento" htmlFor="method">
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={inputClass}
            >
              <option value="DINHEIRO">Dinheiro</option>
              <option value="CARTAO">Cartão</option>
              <option value="PIX">Pix</option>
              <option value="OUTRO">Outro</option>
            </select>
          </Field>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Cliente" htmlFor="customerId">
              <select
                id="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {customers.length === 0 && (
                <p className="text-xs text-amber-600">
                  Cadastre um cliente na página Clientes antes de continuar.
                </p>
              )}
            </Field>
            <Field label="Vencimento" htmlFor="dueDate">
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-1.5">
          <label htmlFor="notes" className={labelClass}>
            Observações
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Opcional"
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-medium text-slate-500">Total</span>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(total)}
          </span>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="mt-4 w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Registrando..." : "Finalizar venda"}
        </button>
      </Card>
    </div>
  );
}
