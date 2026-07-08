import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const name = process.env.ADMIN_NAME ?? "Administrador";
  const email = process.env.ADMIN_EMAIL ?? "admin@flash.local";
  const password = process.env.ADMIN_PASSWORD ?? "troque-esta-senha";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Usuario admin ja existe: ${email}`);
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, passwordHash, role: "ADMIN" },
  });

  console.log("Usuario administrador criado com sucesso:");
  console.log(`  E-mail: ${email}`);
  console.log(`  Senha:  ${password}`);
  console.log("Troque a senha assim que possivel em Usuarios.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
