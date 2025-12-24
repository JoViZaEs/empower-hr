import { UserPlus, CalendarPlus, FileSignature, Shirt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: "Nuevo Empleado",
    icon: UserPlus,
    color: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
  {
    label: "Programar Examen",
    icon: CalendarPlus,
    color: "bg-success hover:bg-success/90 text-success-foreground",
  },
  {
    label: "Crear Evento",
    icon: FileSignature,
    color: "bg-info hover:bg-info/90 text-info-foreground",
  },
  {
    label: "Registrar Dotación",
    icon: Shirt,
    color: "bg-warning hover:bg-warning/90 text-warning-foreground",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="mb-4 text-lg font-semibold">Acciones Rápidas</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            className={`h-auto flex-col gap-2 py-4 ${action.color}`}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
      
      <Button
        variant="outline"
        className="mt-4 w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Ver todas las acciones
      </Button>
    </div>
  );
}
