import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { Badge, Card, PageHeader } from "@/components/ui";
import { NewUserButton } from "./new-user-button";
import { UserRowActions } from "./user-row-actions";

export default async function UsuariosPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader
        title="Vendedores e acessos"
        description="Gerencie quem pode acessar o Flash."
        action={<NewUserButton />}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Perfil</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {user.name}
                    {user.id === session.userId && (
                      <span className="ml-2 text-xs text-slate-400">
                        (você)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge color={user.role === "ADMIN" ? "blue" : "slate"}>
                      {user.role === "ADMIN" ? "Administrador" : "Vendedor"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={user.active ? "green" : "red"}>
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <UserRowActions
                      user={user}
                      isSelf={user.id === session.userId}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
