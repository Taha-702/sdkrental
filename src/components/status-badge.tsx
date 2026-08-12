const styles: Record<string, string> = {
  pending: "bg-warning/20 text-warning-foreground border-warning/40",
  approved: "bg-success/15 text-success border-success/40",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
  completed: "bg-primary/10 text-primary border-primary/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
        styles[status] ?? styles["cancelled"]
      }`}
    >
      {status}
    </span>
  );
}
