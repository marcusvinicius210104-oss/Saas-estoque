import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { NewProductButton } from "./new-product-button";
import { ProductRowActions } from "./product-row-actions";

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  const totalValue = products.reduce(
    (sum, p) => sum + p.quantity * p.costPrice,
    0
  );
  const lowStockCount = products.filter(
    (p) => p.quantity <= p.minStock
  ).length;

  return (
    <div>
      <PageHeader
        title="Estoque"
        description={`${products.length} produto(s) cadastrado(s) · valor em estoque ${formatCurrency(totalValue)}${lowStockCount > 0 ? ` · ${lowStockCount} com estoque baixo` : ""}`}
        action={<NewProductButton />}
      />

      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Cadastre seu primeiro produto para começar a controlar o estoque."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Produto</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Categoria</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Estoque
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Custo
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Venda
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const low = product.quantity <= product.minStock;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {product.category || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge color={low ? "red" : "green"}>
                          {product.quantity} un.
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {formatCurrency(product.costPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(product.salePrice)}
                      </td>
                      <td className="px-4 py-3">
                        <ProductRowActions product={product} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
