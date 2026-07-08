import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { NewCustomerButton } from "./new-customer-button";
import { CustomerRowActions } from "./customer-row-actions";

export default async function ClientesPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: {
      sales: {
        where: { status: { in: ["PENDENTE", "PARCIAL"] } },
        include: { payments: true },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${customers.length} cliente(s) cadastrado(s)`}
        action={<NewCustomerButton />}
      />

      <Card className="overflow-hidden">
        {customers.length === 0 ? (
          <EmptyState
            title="Nenhum cliente cadastrado"
            description="Cadastre clientes para registrar vendas a prazo."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">Telefone</th>
                  <th className="px-4 py-3 font-semibold">CPF/CNPJ</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Saldo em aberto
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => {
                  const openBalance = customer.sales.reduce((sum, sale) => {
                    const paid = sale.payments.reduce(
                      (s, p) => s + p.amount,
                      0
                    );
                    return sum + (sale.total - paid);
                  }, 0);

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {customer.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {customer.document || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {openBalance > 0 ? (
                          <Badge color="amber">
                            {formatCurrency(openBalance)}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <CustomerRowActions customer={customer} />
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
