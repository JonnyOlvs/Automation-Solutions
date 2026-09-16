import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { authApi } from "@/api/endpoints";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await authApi.login(email.trim(), password);
      login(token, user);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-navy px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green text-lg font-bold">AS</div>
          <p className="mt-3 text-lg font-semibold">Automated Solutions</p>
          <p className="text-xs text-white/50">QA Automation Platform</p>
        </div>

        <Card className="border-white/10 bg-white shadow-xl">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1 text-center">
              <h1 className="text-base font-semibold text-foreground">Iniciar sesión</h1>
              <p className="text-xs text-muted-foreground">Accede con tu correo y contraseña asignados.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Correo</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    autoFocus
                    autoComplete="username"
                    placeholder="tu@empresa.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="rounded-md bg-status-fail/10 px-3 py-2 text-xs text-status-fail">{error}</p>}

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-[11px] text-white/40">Confidence in every release</p>
      </div>
    </div>
  );
}
