import { Zap } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 shadow-lg shadow-amber-500/30">
            <Zap className="h-8 w-8 fill-slate-900 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">Flash</h1>
          <p className="text-sm text-slate-400">
            Controle de estoque e vendas
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Acesso restrito ao proprietário e vendedores autorizados.
        </p>
      </div>
    </div>
  );
}
