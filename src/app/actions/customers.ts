"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

const CustomerSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do cliente."),
  phone: z.string().trim().optional(),
  document: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export async function createCustomer(formData: FormData) {
  await verifySession();

  const parsed = CustomerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    document: formData.get("document") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  await prisma.customer.create({ data: parsed.data });
  revalidatePath("/clientes");
  revalidatePath("/vendas");
}

export async function updateCustomer(customerId: string, formData: FormData) {
  await verifySession();

  const parsed = CustomerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    document: formData.get("document") || undefined,
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: parsed.data,
  });

  revalidatePath("/clientes");
}

export async function deleteCustomer(customerId: string) {
  await verifySession();

  const salesCount = await prisma.sale.count({ where: { customerId } });
  if (salesCount > 0) {
    throw new Error(
      "Este cliente possui vendas registradas e não pode ser excluído."
    );
  }

  await prisma.customer.delete({ where: { id: customerId } });
  revalidatePath("/clientes");
}
