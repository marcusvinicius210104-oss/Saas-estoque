"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { hashPassword } from "@/lib/password";

const CreateUserSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: z.enum(["ADMIN", "VENDEDOR"]),
});

export async function createUser(formData: FormData) {
  await requireAdmin();

  const parsed = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    throw new Error("Já existe um usuário com esse e-mail.");
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash,
    },
  });

  revalidatePath("/usuarios");
}

const UpdateUserSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome."),
  role: z.enum(["ADMIN", "VENDEDOR"]),
});

export async function updateUser(userId: string, formData: FormData) {
  const session = await requireAdmin();

  const parsed = UpdateUserSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  if (session.userId === userId && parsed.data.role !== "ADMIN") {
    throw new Error("Você não pode remover seu próprio acesso de administrador.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
  });

  revalidatePath("/usuarios");
}

export async function toggleUserActive(userId: string, active: boolean) {
  const session = await requireAdmin();

  if (session.userId === userId) {
    throw new Error("Você não pode desativar sua própria conta.");
  }

  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/usuarios");
}

const ResetPasswordSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export async function resetUserPassword(userId: string, formData: FormData) {
  await requireAdmin();

  const parsed = ResetPasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath("/usuarios");
}
