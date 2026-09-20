import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, Home, Plus, User } from "lucide-react";
import type { ReactNode } from "react";

export type AppTab = "board" | "post" | "profile";

interface AppShellProps {
  active: AppTab;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  showTabs?: boolean;
}

/**
 * Phone-shaped app frame: fixed header, scrollable body, fixed bottom tabs.
 * On wider screens the same frame sits centred on a stage backdrop.
 */
export function AppShell({
  active,
  children,
  header,
  footer,
  overlay,
  showTabs = true,
}: AppShellProps) {
  return (
    <div className="app-stage flex min-h-dvh justify-center md:items-center md:p-6">
      <div
        className="relative flex h-dvh w-full max-w-[440px] flex-col overflow-hidden bg-background shadow-[0_30px_70px_-35px_oklch(0.28_0.05_50/0.7)] md:h-[calc(100dvh-3rem)] md:max-h-[920px] md:rounded-[2.5rem] md:border md:border-border"
      >
        {header}
        <main className="relative flex-1 overflow-y-auto overscroll-contain">{children}</main>
        {footer}
        {showTabs ? <TabBar active={active} /> : null}
        {overlay}
      </div>
    </div>
  );
}

function TabBar({ active }: { active: AppTab }) {
  return (
    <nav className="safe-bottom z-30 flex-none border-t border-border bg-paper/95 backdrop-blur-xl">
      <div className="grid grid-cols-3 items-center gap-2 px-5 py-2">
        <TabButton to="/" icon={Home} label="Board" isActive={active === "board"} />
        <div className="flex justify-center">
          <Link
            to="/post"
            aria-label="Post a class"
            className={`tap grid size-12 place-items-center rounded-2xl shadow-[0_12px_26px_-14px_oklch(0.62_0.15_52/0.9)] transition-transform active:scale-95 ${
              active === "post" ? "bg-foreground text-background" : "bg-primary text-primary-foreground"
            }`}
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </Link>
        </div>
        <TabButton
          to="/profile"
          icon={User}
          label="Profile"
          isActive={active === "profile"}
        />
      </div>
    </nav>
  );
}

function TabButton({
  to,
  icon: Icon,
  label,
  isActive,
}: {
  to: "/" | "/profile";
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      to={to}
      className={`tap flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${
        isActive ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      <Icon className="size-5" strokeWidth={isActive ? 2.4 : 1.9} />
      {label}
    </Link>
  );
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  backTo: "/" | "/post" | "/profile";
  action?: ReactNode;
}

export function TopBar({ title, subtitle, backTo, action }: TopBarProps) {
  return (
    <header className="safe-top z-30 flex-none border-b border-border bg-paper/90 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Link
          to={backTo}
          aria-label="Go back"
          className="tap grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="min-w-0 leading-tight">
          <h1 className="truncate font-display text-lg font-semibold">{title}</h1>
          {subtitle ? <p className="chip-label truncate">{subtitle}</p> : null}
        </div>
        {action ? <div className="ml-auto shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
