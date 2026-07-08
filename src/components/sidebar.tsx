"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Wallet,
  Package,
  Users,
  UserCog,
  Zap,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/vendas", label: "Nova venda", icon: ShoppingCart },
  { href: "/vendas/historico", label: "Histórico de vendas", icon: Receipt },
  { href: "/contas-a-receber", label: "Contas a receber", icon: Wallet },
  { href: "/produtos", label: "Estoque", icon: Package },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/usuarios", label: "Vendedores", icon: UserCog, adminOnly: true },
];

export function Sidebar({
  role,
  name,
}: {
  role: "ADMIN" | "VENDEDOR";
  name: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN");

  const activeHref = items
    .filter((item) => pathname === item.href || pathname.startsWith(item.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const content = (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400">
          <Zap className="h-5 w-5 fill-slate-900 text-slate-900" />
        </div>
        <span className="text-lg font-bold text-white">Flash</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = item.href === activeHref;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-amber-400 text-slate-900"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="text-xs text-slate-500">
            {role === "ADMIN" ? "Administrador" : "Vendedor"}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden w-64 shrink-0 md:block">{content}</div>

      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400">
            <Zap className="h-4 w-4 fill-slate-900 text-slate-900" />
          </div>
          <span className="text-base font-bold text-white">Flash</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative inset-y-0 left-0 h-full w-64">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-slate-300 hover:bg-slate-800"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
