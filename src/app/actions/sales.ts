"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

const SaleItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
});

const CreateSaleSchema = z.object({
  customerId: z.string().min(1).optional(),
  paymentType: z.enum(["A_VISTA", "A_PRAZO"]),
  method: z.enum(["DINHEIRO", "CARTAO", "PIX", "OUTRO"]).optional(),
  dueDate: z.string().optional(),
  notes: z.string().trim().optional(),
  items: z.array(SaleItemSchema).min(1, "Adicione pelo menos um produto."),
});

export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;

export async function createSale(input: CreateSaleInput) {
  const session = await verifySession();

  const parsed = CreateSaleSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }
  const data = parsed.data;

  if (data.paymentType === "A_PRAZO" && !data.customerId) {
    throw new Error("Selecione um cliente para vendas a prazo.");
  }
  if (data.paymentType === "A_PRAZO" && !data.dueDate) {
    throw new Error("Informe a data de vencimento.");
  }
  if (data.paymentType === "A_VISTA" && !data.method) {
    throw new Error("Selecione a forma de pagamento.");
  }

  const saleId = await prisma.$transaction(async (tx) => {
    const productIds = data.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("Produto não encontrado.");
      }
      if (product.quantity < item.quantity) {
        throw new Error(
          `Estoque insuficiente para "${product.name}" (disponível: ${product.quantity}).`
        );
      }
      total += item.quantity * item.unitPrice;
    }

    const sale = await tx.sale.create({
      data: {
        customerId: data.customerId,
        userId: session.userId,
        paymentType: data.paymentType,
        method: data.paymentType === "A_VISTA" ? data.method : null,
        status: data.paymentType === "A_VISTA" ? "PAGO" : "PENDENTE",
        total,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes,
      },
    });

    for (const item of data.items) {
      const product = productMap.get(item.productId)!;
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: product.costPrice,
          subtotal: item.quantity * item.unitPrice,
        },
      });

      await tx.product.update({
        where: { id: product.id },
        data: { quantity: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: "SAIDA",
          quantity: -item.quantity,
          note: `Venda #${sale.id.slice(-6).toUpperCase()}`,
          userId: session.userId,
        },
      });
    }

    if (data.paymentType === "A_VISTA") {
      await tx.payment.create({
        data: {
          saleId: sale.id,
          amount: total,
          method: data.method!,
          userId: session.userId,
        },
      });
    }

    return sale.id;
  });

  revalidatePath("/produtos");
  revalidatePath("/dashboard");
  revalidatePath("/vendas/historico");
  revalidatePath("/contas-a-receber");

  return saleId;
}

const PaymentSchema = z.object({
  amount: z.coerce.number().positive("Informe um valor válido."),
  method: z.enum(["DINHEIRO", "CARTAO", "PIX", "OUTRO"]),
});

export async function registerPayment(saleId: string, formData: FormData) {
  const session = await verifySession();

  const parsed = PaymentSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUniqueOrThrow({
      where: { id: saleId },
      include: { payments: true },
    });

    if (sale.status === "CANCELADO") {
      throw new Error("Esta venda está cancelada.");
    }

    const alreadyPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = sale.total - alreadyPaid;

    if (parsed.data.amount > remaining + 0.009) {
      throw new Error(
        `O valor informado é maior que o saldo devedor (${remaining.toFixed(2)}).`
      );
    }

    await tx.payment.create({
      data: {
        saleId,
        amount: parsed.data.amount,
        method: parsed.data.method,
        userId: session.userId,
      },
    });

    const newPaid = alreadyPaid + parsed.data.amount;
    const status = newPaid >= sale.total - 0.009 ? "PAGO" : "PARCIAL";

    await tx.sale.update({ where: { id: saleId }, data: { status } });
  });

  revalidatePath("/contas-a-receber");
  revalidatePath("/vendas/historico");
  revalidatePath("/dashboard");
}
