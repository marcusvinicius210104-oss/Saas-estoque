import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { SaleForm } from "./sale-form";

export default async function VendasPage() {
  const [products, customers] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        salePrice: true,
        quantity: true,
      },
    }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Nova venda"
        description="Registre uma venda à vista ou a prazo e o estoque é atualizado automaticamente."
      />
      <SaleForm products={products} customers={customers} />
    </div>
  );
}
