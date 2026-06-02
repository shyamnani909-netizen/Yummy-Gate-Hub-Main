import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { signInWithCredentials } from "@/lib/auth-client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({ component: SignupPage });

const createAccount = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const { createAuthUser } = await import("@/server/auth-users");
    return createAuthUser(data.email, data.password);
  });

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    {
      label: "Upper and lowercase letters",
      valid: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { label: "A number or symbol", valid: /[\d\W_]/.test(password) },
  ];
  const hasCommonPattern = /^(password|qwerty|123456|12345678|shyam123)$/i.test(password);
  const isPasswordReady = passwordChecks.every((check) => check.valid) && !hasCommonPattern;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isPasswordReady) {
      toast.error("Choose a stronger password before signing up.");
      return;
    }
    setLoading(true);
    try {
      const result = await createAccount({ data: { email, password } });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      const signInResult = await signInWithCredentials(email, password, "/menu");
      if (!signInResult.ok) {
        toast.success("Account created. Please log in to continue.");
        window.location.assign("/login");
        return;
      }

      toast.success("Account created. Taking you to the menu.");
      window.location.assign("/menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto flex items-center justify-center px-4 py-16">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm"
        >
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign up and start ordering today.</p>
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="mt-2 grid gap-1 text-xs text-muted-foreground" aria-live="polite">
                {passwordChecks.map((check) => (
                  <p key={check.label} className={check.valid ? "text-green-700" : ""}>
                    {check.valid ? "OK" : "-"} {check.label}
                  </p>
                ))}
                {hasCommonPattern && (
                  <p className="text-destructive">Avoid common passwords or personal names.</p>
                )}
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full mt-6" disabled={loading || !isPasswordReady}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
          <p className="text-sm text-center mt-4 text-muted-foreground">
            Already have one?{" "}
            <Link to="/login" className="text-primary font-medium">
              Login
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
