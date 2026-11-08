import { useState, type FormEvent } from "react";
import { Link, Redirect, useLocation } from "wouter";
import { ShieldCheck, Store } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { useAuth } from "@/_core/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { friendlyError } from "@/_core/errors";

/**
 * Admin sign-up — standalone (no store chrome, no admin shell), because it must
 * be reachable by someone who is not signed in yet.
 *
 * Creating an admin account requires the shared ADMIN_SIGNUP_CODE. The code is
 * verified SERVER-SIDE and the role is assigned there; this form never sends a
 * role. When the variable is unset the server reports the feature as disabled
 * and this page says so instead of offering a form that cannot work.
 */
export default function AdminSignup() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const status = trpc.auth.adminSignupStatus.useQuery();
  const signupM = trpc.auth.adminSignup.useMutation();

  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await signupM.mutateAsync({ code, fullName, email, password, confirmPassword });
      await Promise.all([utils.auth.me.invalidate(), utils.auth.session.invalidate()]);
      navigate("/admin");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  if (user) return <Redirect to="/admin" />;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
      <Card className="border-indigo-200">
        <CardHeader>
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <CardTitle>Create an administrator account</CardTitle>
          <CardDescription>
            This creates an account with full access to the MarketHub admin dashboard. It requires
            the admin sign-up code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status.isLoading ? (
            <p className="text-sm text-muted-foreground">Checking availability…</p>
          ) : status.data?.enabled === false ? (
            <div className="rounded-lg border border-amber/40 bg-amber/10 p-4 text-sm">
              <p className="font-medium">Admin sign-up is disabled.</p>
              <p className="mt-1 text-muted-foreground">
                Set <code className="rounded bg-muted px-1">ADMIN_SIGNUP_CODE</code> in the
                environment to enable it, then reload this page.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Admin sign-up code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Provided by the store owner"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
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
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">At least 8 characters.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creating…" : "Create administrator account"}
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already an administrator?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Store className="h-3.5 w-3.5" />
            <Link to="/" className="hover:text-foreground">
              Back to the store
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
