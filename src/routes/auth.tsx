import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles, Trophy } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/useSession";
import { AppShell } from "@/components/AppShell";

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
    <AppShell active="board" showTabs={false}>
      <div className="flex min-h-full flex-col px-6 py-8">
        <div className="flex items-center gap-2.5">
          <span className="grid size-11 place-items-center rounded-2xl bg-marigold font-display text-xl font-semibold text-foreground">
            म
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl font-semibold">Madhura</span>
            <span className="chip-label block">Masterclass board</span>
          </span>
        </div>

        <div className="mt-10">
          <h1 className="font-display text-[28px] leading-tight">
            Teach what you know.
            <br />
            Find your next master.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            One board for physical classes, online sessions and competitions — from flute and
            Kannada to options trading and AI tools.
          </p>

          <ul className="mt-6 space-y-3">
            {[
              { icon: Check, text: "Post a class or competition in under a minute" },
              { icon: Sparkles, text: "Filter by music, language, curriculum, trading, AI tools" },
              { icon: Trophy, text: "Reach learners in your city and online" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-clay">
                  <Icon className="size-3.5" />
                </span>
                <span className="text-sm text-muted-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-10">
          <button
            onClick={signIn}
            disabled={busy}
            className="tap flex h-13 w-full items-center justify-center gap-3 rounded-2xl bg-foreground text-sm font-semibold text-background disabled:opacity-60"
          >
            <span className="grid size-6 place-items-center rounded-full bg-background font-display text-[13px] text-foreground">
              G
            </span>
            {busy ? "Opening Google…" : "Continue with Google"}
          </button>
          {error ? <p className="mt-3 text-center text-sm text-destructive">{error}</p> : null}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            We only use your name, email and photo. Nothing else.
          </p>
          <Link
            to="/"
            className="tap mt-5 block h-11 rounded-2xl border border-input text-center leading-11 text-sm font-medium text-muted-foreground"
          >
            Just browsing the board
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
