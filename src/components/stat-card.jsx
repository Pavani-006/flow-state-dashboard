import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const accents = {
  primary: "from-primary/15 to-primary/5 text-primary",
  success: "from-success/15 to-success/5 text-success",
  warning: "from-warning/20 to-warning/5 text-warning-foreground",
  destructive: "from-destructive/15 to-destructive/5 text-destructive",
};

export function StatCard({ label, value, delta, icon: Icon, accent = "primary", className }) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden border bg-card transition-all hover:shadow-elevated hover:-translate-y-0.5",
        className,
      )}
    >
      <div
        className={cn(
          "absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl opacity-60",
          accents[accent],
        )}
      />
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br",
              accents[accent],
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          {delta && <span className="text-xs font-medium text-success">{delta}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
