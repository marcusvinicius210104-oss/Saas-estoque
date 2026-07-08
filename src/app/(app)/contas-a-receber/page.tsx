import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { SaleStatusBadge } from "@/components/sale-badges";
import { RegisterPaymentButton } from "./register-payment-button";
import { Wallet, AlertTriangle, Clock } from "lucide-react";

export default async function ContasReceberPage() {
  const sales = await prisma.sale.findMany({
    where: { paymentType: "A_PRAZO", status: { in: ["PENDENTE", "PARCIAL"] } },
    orderBy: { dueDate: "asc" },
    include: { customer: true, payments: true },
  });

  const now = new Date();

  const rows = sales.map((sale) => {
    const paid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = sale.total - paid;
    const overdue = !!sale.dueDate && sale.dueDate < now;
    return { sale, paid, remaining, overdue };
  });

  const totalOpen = rows.reduce((sum, r) => sum + r.remaining, 0);
  const totalOverdue = rows
    .filter((r) => r.overdue)
    .reduce((sum, r) => sum + r.remaining, 0);

  return (
    <div>
      <PageHeader
        title="Contas a receber"
        description="Vendas a prazo em aberto e controle de recebimentos."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total em aberto"
          value={formatCurrency(totalOpen)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Total atrasado"
          value={formatCurrency(totalOverdue)}
          tone="danger"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          label="Vendas em aberto"
          value={String(rows.length)}
          tone="warning"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState
            title="Nenhuma conta em aberto"
            description="Todas as vendas a prazo estão quitadas."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Vencimento</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Total
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Pago
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Saldo
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(({ sale, paid, remaining, overdue }) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {sale.customer?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {sale.dueDate ? formatDate(sale.dueDate) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <SaleStatusBadge status={sale.status} overdue={overdue} />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(paid)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(remaining)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RegisterPaymentButton
                        saleId={sale.id}
                        remaining={remaining}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
