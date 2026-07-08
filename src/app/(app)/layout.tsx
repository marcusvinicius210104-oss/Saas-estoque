import { verifySession } from "@/lib/dal";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <Sidebar role={session.role} name={session.name} />
      <main className="flex-1 overflow-x-hidden bg-slate-50 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
