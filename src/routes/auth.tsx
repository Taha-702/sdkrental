import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — New Sadiqabad Rent a Car" },
      { name: "description", content: "Secure sign-in for the New Sadiqabad Rent a Car booking administrator." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Sign In — New Sadiqabad Rent a Car" },
      { property: "og:description", content: "Staff access to the booking management dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    const { data: isAdmin } = await supabase.rpc("ensure_admin_role");
    setLoading(false);
    if (!isAdmin) {
      await supabase.auth.signOut();
      toast.error("This account does not have admin access.");
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col px-4 py-20">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage booking requests, approvals and the fleet.
          </p>

          <form onSubmit={signIn} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />} Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
