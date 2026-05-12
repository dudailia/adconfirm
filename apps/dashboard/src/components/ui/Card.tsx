import clsx from "clsx";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx("bg-surface border border-border rounded-xl p-5", className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  trend,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: string | number;
  trend?: { value: number; label: string };
  prefix?: string;
  suffix?: string;
}) {
  return (
    <Card>
      <div className="text-xs text-muted-fg mb-2">{label}</div>
      <div className="font-mono text-2xl font-medium text-white">
        {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
      </div>
      {trend && (
        <div className={clsx("text-xs mt-1", trend.value >= 0 ? "text-success" : "text-danger")}>
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </Card>
  );
}
