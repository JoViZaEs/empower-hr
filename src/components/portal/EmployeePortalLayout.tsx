import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useEmployeePortalAuth } from '@/hooks/useEmployeePortalAuth';
import { Button } from '@/components/ui/button';
import {
  Home, PenTool, ClipboardList, FileText, DollarSign, Award,
  User, LogOut, BookOpen, GraduationCap, ClipboardCheck, CalendarDays,
  Stethoscope, Shirt, ShieldAlert,
} from 'lucide-react';

const navItems = [
  { to: '/Funcionarios/inicio', label: 'Inicio', icon: Home },
  { to: '/Funcionarios/pendientes/firmar', label: 'Por firmar', icon: PenTool },
  { to: '/Funcionarios/pendientes/hacer', label: 'Por hacer', icon: ClipboardList },
  { to: '/Funcionarios/cursos', label: 'Cursos', icon: GraduationCap },
  { to: '/Funcionarios/evaluaciones', label: 'Evaluaciones', icon: ClipboardCheck },
  { to: '/Funcionarios/eventos', label: 'Eventos', icon: CalendarDays },
  { to: '/Funcionarios/examenes', label: 'Exámenes médicos', icon: Stethoscope },
  { to: '/Funcionarios/vigilancias', label: 'Vigilancia', icon: ShieldAlert },
  { to: '/Funcionarios/dotacion', label: 'Dotación', icon: Shirt },
  { to: '/Funcionarios/desprendibles', label: 'Desprendibles', icon: DollarSign },
  { to: '/Funcionarios/certificados', label: 'Certificados', icon: Award },
  { to: '/Funcionarios/reglamento', label: 'Reglamento', icon: BookOpen },
  { to: '/Funcionarios/perfil', label: 'Mi perfil', icon: User },
];

export function EmployeePortalLayout({ children }: { children: ReactNode }) {
  const { employee, signOut } = useEmployeePortalAuth();
  const navigate = useNavigate();
  const initials = employee ? `${employee.first_name?.[0] ?? ''}${employee.last_name?.[0] ?? ''}` : '';

  return (
    <div className="min-h-screen bg-muted/30 text-[16px]">
      <header className="border-b bg-background sticky top-0 z-20">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary overflow-hidden">
              {employee?.photo_url ? <img src={employee.photo_url} alt="" className="h-full w-full object-cover" /> : initials}
            </div>
            <div>
              <p className="font-semibold leading-tight">{employee?.first_name} {employee?.last_name}</p>
              <p className="text-sm text-muted-foreground leading-tight">{employee?.position || 'Empleado'}</p>
            </div>
          </div>
          <Button variant="ghost" size="lg" onClick={async () => { await signOut(); navigate('/Funcionarios'); }}>
            <LogOut className="h-5 w-5 mr-2" /> Salir
          </Button>
        </div>
      </header>

      <div className="container py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <aside className="md:sticky md:top-20 self-start">
          <nav className="grid grid-cols-2 md:grid-cols-1 gap-2 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            {navItems.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                  }`
                }
              >
                <it.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{it.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="space-y-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
