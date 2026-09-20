import { X } from "lucide-react";
import type { ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Bottom sheet that always stays inside the phone frame. */
export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="animate-in fade-in-0 absolute inset-0 duration-200 bg-foreground/45 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-label={title}
        className="safe-bottom animate-in slide-in-from-bottom-8 fade-in-0 relative rounded-t-3xl border-t border-border bg-paper duration-300"
      >
        <div className="px-4 pt-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-border" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="tap grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[56dvh] overflow-y-auto px-4 py-4">{children}</div>
        {footer ? <div className="border-t border-border px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}
