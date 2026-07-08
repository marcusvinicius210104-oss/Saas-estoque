import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { PaymentTypeBadge, SaleStatusBadge } from "@/components/sale-badges";
import { SaleDetailsToggle } from "./sale-details";

export default async function HistoricoVendasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const params = await searchParams;

  const where: Prisma.SaleWhereInput = {};
  if (params.status) where.status = params.status as Prisma.SaleWhereInput["status"];
  if (params.type) where.paymentType = params.type as Prisma.SaleWhereInput["paymentType"];

  const sales = await prisma.sale.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { customer: true, user: true, items: true },
    take: 200,
  });

  const now = new Date();

  return (
    <div>
      <PageHeader
        title="Histórico de vendas"
        description={`${sales.length} venda(s) encontrada(s)`}
      />

      <form className="mb-4 flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="PAGO">Pago</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PARCIAL">Parcial</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
        <select
          name="type"
          defaultValue={params.type ?? ""}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          <option value="A_VISTA">À vista</option>
          <option value="A_PRAZO">A prazo</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Filtrar
        </button>
      </form>

      <Card className="overflow-hidden">
        {sales.length === 0 ? (
          <EmptyState title="Nenhuma venda encontrada" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Vendedor</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Total
                  </th>
                  <th className="px-4 py-3 font-semibold">Itens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => {
                  const overdue =
                    !!sale.dueDate &&
                    sale.dueDate < now &&
                    (sale.status === "PENDENTE" || sale.status === "PARCIAL");
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">
                        {formatDateTime(sale.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {sale.customer?.name ?? "Venda direta"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {sale.user.name}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentTypeBadge type={sale.paymentType} />
                      </td>
                      <td className="px-4 py-3">
                        <SaleStatusBadge status={sale.status} overdue={overdue} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-4 py-3">
                        <SaleDetailsToggle items={sale.items} />
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
