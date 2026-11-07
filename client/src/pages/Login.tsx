import { useState, type FormEvent } from "react";
import { Link, Redirect, useLocation } from "wouter";
import { Store } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { guestToken, clearGuestToken } from "@/lib/guest";

export default function Login() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loginM = trpc.auth.login.useMutation();
  const mergeM = trpc.cart.mergeGuest.useMutation();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await loginM.mutateAsync({ identifier, password });
      // Carry the guest cart into the account, then drop the guest token.
      try {
        await mergeM.mutateAsync({ guestToken: guestToken() });
      } catch {
        /* a merge failure must not block a successful login */
      }
      clearGuestToken();
      await Promise.all([utils.auth.me.invalidate(), utils.auth.session.invalidate(), utils.cart.get.invalidate()]);
      navigate("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  if (user) return <Redirect to="/account" />;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center p-6">
      <Card>
        <CardHeader>
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-primary to-violet text-white">
            <Store className="h-5 w-5" />
          </span>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Log in with your email or phone number.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or phone</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or 08012345678"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Logging in…" : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
