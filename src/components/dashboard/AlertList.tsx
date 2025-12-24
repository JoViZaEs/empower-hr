import { AlertTriangle, Calendar, FileWarning, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "urgent" | "warning" | "info";
  title: string;
  description: string;
  date: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "urgent",
    title: "Exámenes vencidos",
    description: "3 empleados con exámenes periódicos vencidos",
    date: "Hace 2 días",
  },
  {
    id: "2",
    type: "warning",
    title: "Firmas pendientes",
    description: "8 empleados no han firmado la reinducción",
    date: "Hace 1 semana",
  },
  {
    id: "3",
    type: "warning",
    title: "COPASST próximo a vencer",
    description: "La vigencia del comité termina en 15 días",
    date: "En 15 días",
  },
  {
    id: "4",
    type: "info",
    title: "Dotación programada",
    description: "Entrega de dotación trimestral pendiente",
    date: "En 5 días",
  },
];

const typeStyles = {
  urgent: {
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    icon: AlertTriangle,
    iconColor: "text-destructive",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/20",
    icon: FileWarning,
    iconColor: "text-warning",
  },
  info: {
    bg: "bg-info/10",
    border: "border-info/20",
    icon: Calendar,
    iconColor: "text-info",
  },
};

export function AlertList() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Alertas Pendientes</h3>
        <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
          {alerts.length} alertas
        </span>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => {
          const style = typeStyles[alert.type];
          const Icon = style.icon;
          
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-secondary/50 cursor-pointer",
                style.bg,
                style.border
              )}
            >
              <div className={cn("mt-0.5", style.iconColor)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{alert.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {alert.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {alert.date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
