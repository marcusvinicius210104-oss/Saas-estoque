"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";

const ProductSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do produto."),
  sku: z.string().trim().min(1, "Informe o código (SKU)."),
  category: z.string().trim().optional(),
  costPrice: z.coerce.number().min(0, "O preço de custo não pode ser negativo."),
  salePrice: z.coerce.number().min(0, "O preço de venda não pode ser negativo."),
  quantity: z.coerce.number().int().min(0, "A quantidade não pode ser negativa."),
  minStock: z.coerce.number().int().min(0, "O estoque mínimo não pode ser negativo."),
});

export async function createProduct(formData: FormData) {
  const session = await verifySession();

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    category: formData.get("category") || undefined,
    costPrice: formData.get("costPrice"),
    salePrice: formData.get("salePrice"),
    quantity: formData.get("quantity"),
    minStock: formData.get("minStock"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const data = parsed.data;

  const existing = await prisma.product.findUnique({
    where: { sku: data.sku },
  });
  if (existing) {
    throw new Error("Já existe um produto com esse código (SKU).");
  }

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({ data });
    if (data.quantity > 0) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: "ENTRADA",
          quantity: data.quantity,
          note: "Estoque inicial",
          userId: session.userId,
        },
      });
    }
  });

  revalidatePath("/produtos");
  revalidatePath("/dashboard");
}

export async function updateProduct(productId: string, formData: FormData) {
  await verifySession();

  const parsed = ProductSchema.omit({ quantity: true }).safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    category: formData.get("category") || undefined,
    costPrice: formData.get("costPrice"),
    salePrice: formData.get("salePrice"),
    minStock: formData.get("minStock"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const duplicate = await prisma.product.findFirst({
    where: { sku: parsed.data.sku, NOT: { id: productId } },
  });
  if (duplicate) {
    throw new Error("Já existe um produto com esse código (SKU).");
  }

  await prisma.product.update({
    where: { id: productId },
    data: parsed.data,
  });

  revalidatePath("/produtos");
  revalidatePath("/dashboard");
}

export async function deleteProduct(productId: string) {
  await verifySession();

  const salesCount = await prisma.saleItem.count({ where: { productId } });
  if (salesCount > 0) {
    throw new Error(
      "Este produto já possui vendas registradas e não pode ser excluído."
    );
  }

  await prisma.$transaction([
    prisma.stockMovement.deleteMany({ where: { productId } }),
    prisma.product.delete({ where: { id: productId } }),
  ]);

  revalidatePath("/produtos");
  revalidatePath("/dashboard");
}

const MovementSchema = z.object({
  type: z.enum(["ENTRADA", "SAIDA", "AJUSTE"]),
  quantity: z.coerce.number().int(),
  note: z.string().trim().optional(),
});

export async function adjustStock(productId: string, formData: FormData) {
  const session = await verifySession();

  const parsed = MovementSchema.safeParse({
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const { type, quantity, note } = parsed.data;
  if (quantity === 0) {
    throw new Error("Informe uma quantidade diferente de zero.");
  }

  const magnitude = Math.abs(quantity);
  let delta = magnitude;
  if (type === "SAIDA") delta = -magnitude;
  if (type === "AJUSTE") delta = quantity;

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({
      where: { id: productId },
    });

    const newQuantity = product.quantity + delta;
    if (newQuantity < 0) {
      throw new Error("Quantidade insuficiente em estoque para essa saída.");
    }

    await tx.product.update({
      where: { id: productId },
      data: { quantity: newQuantity },
    });

    await tx.stockMovement.create({
      data: {
        productId,
        type,
        quantity: delta,
        note,
        userId: session.userId,
      },
    });
  });

  revalidatePath("/produtos");
  revalidatePath("/dashboard");
}
