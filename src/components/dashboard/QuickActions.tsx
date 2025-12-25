import { 
  UserPlus, 
  CalendarPlus, 
  FileSignature, 
  Shirt, 
  Plus,
  GraduationCap,
  ClipboardCheck,
  Target,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const actions = [
  {
    label: "Nuevo Empleado",
    icon: UserPlus,
    color: "bg-primary hover:bg-primary/90 text-primary-foreground",
    href: "/empleados",
  },
  {
    label: "Programar Examen",
    icon: CalendarPlus,
    color: "bg-success hover:bg-success/90 text-success-foreground",
    href: "/examenes",
  },
  {
    label: "Registrar Curso",
    icon: GraduationCap,
    color: "bg-info hover:bg-info/90 text-info-foreground",
    href: "/cursos",
  },
  {
    label: "Crear Evento",
    icon: FileSignature,
    color: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    href: "/eventos",
  },
  {
    label: "Registrar Dotación",
    icon: Shirt,
    color: "bg-warning hover:bg-warning/90 text-warning-foreground",
    href: "/dotacion",
  },
  {
    label: "Nueva Evaluación",
    icon: ClipboardCheck,
    color: "bg-purple-600 hover:bg-purple-700 text-white",
    href: "/evaluaciones-desempeno",
  },
  {
    label: "Eval. Competencias",
    icon: Target,
    color: "bg-cyan-600 hover:bg-cyan-700 text-white",
    href: "/evaluaciones-competencias",
  },
  {
    label: "Enviar Comunicado",
    icon: Mail,
    color: "bg-rose-600 hover:bg-rose-700 text-white",
    href: "/comunicaciones",
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
            className={`h-auto flex-col gap-2 py-3 ${action.color}`}
            asChild
          >
            <Link to={action.href}>
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
