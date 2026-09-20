import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/useSession";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Madhura Masterclass Board" },
      {
        name: "description",
        content: "Sign in with Google to post classes and competitions on Madhura.",
      },
      { property: "og:title", content: "Sign in — Madhura Masterclass Board" },
      {
        property: "og:description",
        content: "Sign in with Google to post classes and competitions on Madhura.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/post", replace: true });
  }, [loading, user, navigate]);

  async function signIn() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Sign in didn't complete. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/post", replace: true });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-20">
        <div className="surface-card p-8 text-center">
          <h1 className="font-display text-2xl">Sign in to post</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your Google account to list a class, an online session or a competition.
          </p>
          <Button className="mt-6 w-full" onClick={signIn} disabled={busy}>
            {busy ? "Opening Google…" : "Continue with Google"}
          </Button>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </div>
      </main>
    </div>
  );
}
