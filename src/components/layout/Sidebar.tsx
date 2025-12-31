import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  ShieldCheck,
  Shirt,
  UserCheck,
  FileSignature,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
  ClipboardCheck,
  Target,
  Mail,
  KeyRound,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarState } from "./MainLayout";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  moduleCode?: string; // If set, requires permission to view
  adminOnly?: boolean; // If true, only super admins or tenant admins can see
}

const navigation: NavItem[] = [
  { name: "Panel Principal", href: "/", icon: LayoutDashboard },
  { name: "Empleados", href: "/empleados", icon: Users, moduleCode: "empleados" },
  { name: "Vigilancias", href: "/vigilancias", icon: ShieldCheck, moduleCode: "vigilancias" },
  { name: "Exámenes Médicos", href: "/examenes", icon: Stethoscope, moduleCode: "examenes" },
  { name: "Cursos", href: "/cursos", icon: GraduationCap, moduleCode: "cursos" },
  { name: "Dotación", href: "/dotacion", icon: Shirt, moduleCode: "dotacion" },
  { name: "Comités", href: "/comites", icon: UserCheck, moduleCode: "comites" },
  { name: "Eventos y Firmas", href: "/eventos", icon: FileSignature },
  { name: "Eval. Desempeño", href: "/evaluaciones-desempeno", icon: ClipboardCheck, moduleCode: "evaluaciones_desempeno" },
  { name: "Eval. Competencias", href: "/evaluaciones-competencias", icon: Target, moduleCode: "evaluaciones_competencias" },
  { name: "Comunicaciones", href: "/comunicaciones", icon: Mail, moduleCode: "comunicaciones" },
];

const bottomNav: NavItem[] = [
  { name: "Roles y Permisos", href: "/roles-permisos", icon: KeyRound, adminOnly: true },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebarState();
  const location = useLocation();
  const { hasAnyPermission, isSuperAdmin, loading: isLoadingPermissions } = usePermissions();
  const { signOut, profile } = useAuth();

  // Check if user can see a nav item
  const canSeeNavItem = (item: NavItem): boolean => {
    // Super admins can see everything
    if (isSuperAdmin) return true;
    
    // Admin-only items require being a super admin (already checked above)
    // or having at least one role (tenant admin)
    if (item.adminOnly) {
      // For now, we'll show admin items to users with roles
      // This could be refined to check for specific admin permissions
      return true; // Will be hidden by actual RLS if no permission
    }
    
    // Items without moduleCode are visible to everyone
    if (!item.moduleCode) return true;
    
    // Check if user has any permission for this module
    return hasAnyPermission(item.moduleCode);
  };

  // Filter navigation items based on permissions
  const visibleNavigation = navigation.filter(canSeeNavItem);
  const visibleBottomNav = bottomNav.filter(canSeeNavItem);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
              <Building2 className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-bold text-sidebar-foreground">RRHH Pro</h1>
                <p className="text-xs text-sidebar-foreground/60">Gestión Integral</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {isLoadingPermissions ? (
            // Show skeleton while loading permissions
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "h-10 rounded-lg bg-sidebar-accent/30 animate-pulse",
                    collapsed ? "w-12" : "w-full"
                  )}
                />
              ))}
            </div>
          ) : (
            visibleNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "animate-pulse-soft")} />
                  {!collapsed && <span className="animate-fade-in">{item.name}</span>}
                </Link>
              );
            })
          )}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border px-3 py-4">
          {visibleBottomNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
          
          <button 
            onClick={handleSignOut}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>

        {/* Collapse button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-card shadow-md hover:bg-secondary"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>
    </aside>
  );
}
