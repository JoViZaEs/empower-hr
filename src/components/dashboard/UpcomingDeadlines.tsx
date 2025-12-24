import { Calendar, Stethoscope, FileCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Deadline {
  id: string;
  title: string;
  type: "exam" | "signature" | "committee" | "training";
  date: string;
  daysLeft: number;
}

const deadlines: Deadline[] = [
  {
    id: "1",
    title: "Examen periódico - María García",
    type: "exam",
    date: "28 Dic 2024",
    daysLeft: 4,
  },
  {
    id: "2",
    title: "Renovación COPASST",
    type: "committee",
    date: "08 Ene 2025",
    daysLeft: 15,
  },
  {
    id: "3",
    title: "Capacitación en alturas - Grupo A",
    type: "training",
    date: "10 Ene 2025",
    daysLeft: 17,
  },
  {
    id: "4",
    title: "Firmas reinducción SST",
    type: "signature",
    date: "15 Ene 2025",
    daysLeft: 22,
  },
];

const typeConfig = {
  exam: { icon: Stethoscope, color: "text-primary bg-primary/10" },
  signature: { icon: FileCheck, color: "text-success bg-success/10" },
  committee: { icon: Users, color: "text-warning bg-warning/10" },
  training: { icon: Calendar, color: "text-info bg-info/10" },
};

export function UpcomingDeadlines() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Próximos Vencimientos</h3>
        <button className="text-sm font-medium text-primary hover:underline">
          Ver calendario
        </button>
      </div>
      
      <div className="space-y-4">
        {deadlines.map((deadline) => {
          const config = typeConfig[deadline.type];
          const Icon = config.icon;
          
          return (
            <div
              key={deadline.id}
              className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-secondary/50"
            >
              <div className={cn("rounded-lg p-2", config.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{deadline.title}</p>
                <p className="text-sm text-muted-foreground">{deadline.date}</p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  deadline.daysLeft <= 7
                    ? "bg-destructive/10 text-destructive"
                    : deadline.daysLeft <= 14
                    ? "bg-warning/10 text-warning"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {deadline.daysLeft} días
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
