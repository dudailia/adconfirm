import clsx from "clsx";

type BadgeVariant = "active" | "draft" | "paused" | "ended" | "connected" | "disconnected";

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-success/10 text-success border-success/20",
  draft: "bg-muted-fg/10 text-muted-fg border-muted-fg/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  ended: "bg-danger/10 text-danger border-danger/20",
  connected: "bg-success/10 text-success border-success/20",
  disconnected: "bg-muted-fg/10 text-muted-fg border-muted-fg/20",
};

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", variantStyles[variant])}>
      {children}
    </span>
  );
}
