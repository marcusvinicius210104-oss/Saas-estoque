import {
  AlertTriangle,
  Boxes,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";
import { SalesTrendChart } from "./sales-trend-chart";
import { TopProductsChart } from "./top-products-chart";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default async function DashboardPage() {
  const now = new Date();
  const today = startOfDay(now);
  const monthStart = startOfMonth(now);
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 34);

  const [products, recentSales, receivableSales] = await Promise.all([
    prisma.product.findMany(),
    prisma.sale.findMany({
      where: { createdAt: { gte: windowStart } },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sale.findMany({
      where: {
        paymentType: "A_PRAZO",
        status: { in: ["PENDENTE", "PARCIAL"] },
      },
      include: { payments: true },
    }),
  ]);

  const stockValue = products.reduce(
    (sum, p) => sum + p.quantity * p.costPrice,
    0
  );
  const lowStockProducts = products
    .filter((p) => p.quantity <= p.minStock)
    .slice(0, 6);

  const activeSales = recentSales.filter((s) => s.status !== "CANCELADO");

  const salesToday = activeSales.filter((s) => s.createdAt >= today);
  const salesMonth = activeSales.filter((s) => s.createdAt >= monthStart);

  const totalToday = salesToday.reduce((sum, s) => sum + s.total, 0);
  const totalMonth = salesMonth.reduce((sum, s) => sum + s.total, 0);

  const profitMonth = salesMonth.reduce(
    (sum, sale) =>
      sum +
      sale.items.reduce(
        (itemSum, item) =>
          itemSum + (item.unitPrice - item.costPrice) * item.quantity,
        0
      ),
    0
  );

  const receivableRows = receivableSales.map((sale) => {
    const paid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
    return {
      remaining: sale.total - paid,
      overdue: !!sale.dueDate && sale.dueDate < now,
    };
  });
  const totalReceivable = receivableRows.reduce(
    (sum, r) => sum + r.remaining,
    0
  );
  const totalOverdue = receivableRows
    .filter((r) => r.overdue)
    .reduce((sum, r) => sum + r.remaining, 0);

  const last14Start = new Date(today);
  last14Start.setDate(last14Start.getDate() - 13);
  const dayBuckets = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(last14Start);
    d.setDate(d.getDate() + i);
    dayBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const sale of activeSales) {
    if (sale.createdAt < last14Start) continue;
    const key = sale.createdAt.toISOString().slice(0, 10);
    if (dayBuckets.has(key)) {
      dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + sale.total);
    }
  }
  const trendData = Array.from(dayBuckets.entries()).map(([key, total]) => ({
    day: formatDate(key),
    total,
  }));

  const productTotals = new Map<string, number>();
  for (const sale of salesMonth) {
    for (const item of sale.items) {
      productTotals.set(
        item.productName,
        (productTotals.get(item.productName) ?? 0) + item.quantity
      );
    }
  }
  const topProducts = Array.from(productTotals.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Painel"
        description="Visão geral financeira e de estoque do Flash."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Vendas hoje"
          value={formatCurrency(totalToday)}
          hint={`${salesToday.length} venda(s)`}
          icon={<ShoppingBag className="h-5 w-5" />}
        />
        <StatCard
          label="Vendas no mês"
          value={formatCurrency(totalMonth)}
          hint={`${salesMonth.length} venda(s)`}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="success"
        />
        <StatCard
          label="A receber"
          value={formatCurrency(totalReceivable)}
          hint={
            totalOverdue > 0
              ? `${formatCurrency(totalOverdue)} atrasado`
              : "Nenhum valor atrasado"
          }
          icon={<Wallet className="h-5 w-5" />}
          tone={totalOverdue > 0 ? "danger" : "warning"}
        />
        <StatCard
          label="Valor em estoque"
          value={formatCurrency(stockValue)}
          hint={`${products.length} produto(s)`}
          icon={<Boxes className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Vendas nos últimos 14 dias
            </h2>
            <span className="text-xs text-slate-400">
              Lucro estimado no mês: {formatCurrency(profitMonth)}
            </span>
          </div>
          <SalesTrendChart data={trendData} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Estoque baixo
          </h2>
          {lowStockProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Nenhum produto com estoque baixo.
            </p>
          ) : (
            <ul className="space-y-3">
              {lowStockProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="truncate">{product.name}</span>
                  </div>
                  <Badge color="red">{product.quantity} un.</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Mais vendidos no mês
          </h2>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Nenhuma venda registrada neste mês ainda.
            </p>
          ) : (
            <TopProductsChart data={topProducts} />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Resumo financeiro do mês
          </h2>
          <dl className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Receita bruta</dt>
              <dd className="font-semibold text-slate-900">
                {formatCurrency(totalMonth)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Lucro estimado</dt>
              <dd className="font-semibold text-emerald-600">
                {formatCurrency(profitMonth)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">A receber (total)</dt>
              <dd className="font-semibold text-amber-600">
                {formatCurrency(totalReceivable)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Em atraso</dt>
              <dd className="font-semibold text-red-600">
                {formatCurrency(totalOverdue)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <dt className="text-slate-500">Valor total em estoque</dt>
              <dd className="font-semibold text-slate-900">
                {formatCurrency(stockValue)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
