import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertList } from "@/components/dashboard/AlertList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { ComplianceChart } from "@/components/dashboard/ComplianceChart";
import { 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  FileSignature, 
  GraduationCap, 
  ClipboardCheck,
  Target,
  Mail
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths } from "date-fns";

export default function Dashboard() {
  const { data: employeeStats } = useQuery({
    queryKey: ["dashboard-employee-stats"],
    queryFn: async () => {
      const startOfCurrentMonth = startOfMonth(new Date()).toISOString();
      const startOfLastMonth = startOfMonth(subMonths(new Date(), 1)).toISOString();
      const { data: employees, error } = await supabase
        .from("employees")
        .select("id, active, hire_date, created_at");
      if (error) throw error;
      const activeEmployees = employees?.filter(e => e.active) || [];
      const totalActive = activeEmployees.length;
      const newThisMonth = activeEmployees.filter(e => {
        const hireDate = e.hire_date || e.created_at;
        return hireDate && hireDate >= startOfCurrentMonth;
      }).length;
      const newLastMonth = activeEmployees.filter(e => {
        const hireDate = e.hire_date || e.created_at;
        return hireDate && hireDate >= startOfLastMonth && hireDate < startOfCurrentMonth;
      }).length;
      const trend = newLastMonth > 0 
        ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
        : newThisMonth > 0 ? 100 : 0;
      return { totalActive, newThisMonth, trend, trendIsPositive: trend >= 0 };
    },
  });

  const { data: examStats } = useQuery({
    queryKey: ["dashboard-exam-stats"],
    queryFn: async () => {
      const { data: exams, error } = await supabase
        .from("exams")
        .select("id, status, employee_id");
      if (error) throw error;
      const total = exams?.length || 0;
      const upToDate = exams?.filter(e => e.status === "vigente").length || 0;
      const percentage = total > 0 ? Math.round((upToDate / total) * 100) : 0;
      return { total, upToDate, percentage };
    },
  });

  const { data: courseStats } = useQuery({
    queryKey: ["dashboard-course-stats"],
    queryFn: async () => {
      const { data: courses, error } = await supabase
        .from("courses")
        .select("id, status, expiry_date");
      if (error) throw error;
      const total = courses?.length || 0;
      const completed = courses?.filter(c => c.status === "completado").length || 0;
      const expired = courses?.filter(c => c.status === "vencido").length || 0;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { total, completed, expired, percentage };
    },
  });

  const { data: vigilanciaStats } = useQuery({
    queryKey: ["dashboard-vigilancia-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vigilancias")
        .select("id, status");
      if (error) throw error;
      const active = data?.filter(v => v.status === "activa").length || 0;
      const expired = data?.filter(v => v.status === "vencida").length || 0;
      return { total: data?.length || 0, active, expired };
    },
  });

  const { data: evalStats } = useQuery({
    queryKey: ["dashboard-eval-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("id, status");
      if (error) throw error;
      const pending = data?.filter((e: any) => e.status === "pendiente" || e.status === "en_proceso").length || 0;
      return { total: data?.length || 0, pending };
    },
  });

  const { data: commStats } = useQuery({
    queryKey: ["dashboard-comm-stats"],
    queryFn: async () => {
      const startOfCurrentMonth = startOfMonth(new Date()).toISOString();
      const { data, error } = await supabase
        .from("communications")
        .select("id, status, sent_at");
      if (error) throw error;
      const sentThisMonth = data?.filter(c => c.status === "enviado" && c.sent_at && c.sent_at >= startOfCurrentMonth).length || 0;
      return { total: data?.length || 0, sentThisMonth };
    },
  });

  const { data: notificationStats } = useQuery({
    queryKey: ["dashboard-notification-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, read, type");
      if (error) throw error;
      const unread = data?.filter(n => !n.read).length || 0;
      const urgent = data?.filter(n => !n.read && n.type === "warning").length || 0;
      return { unread, urgent };
    },
  });

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Panel Principal</h1>
          <p className="mt-1 text-muted-foreground">
            Bienvenido de nuevo. Aquí está el resumen de hoy.
          </p>
        </div>

        {/* Stats grid - Row 1 */}
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Empleados Activos"
            value={employeeStats?.totalActive ?? "-"}
            subtitle={`${employeeStats?.newThisMonth ?? 0} nuevos este mes`}
            icon={Users}
            trend={employeeStats ? { value: Math.abs(employeeStats.trend), isPositive: employeeStats.trendIsPositive } : undefined}
          />
          <StatCard
            title="Exámenes al Día"
            value={examStats ? `${examStats.percentage}%` : "-"}
            subtitle={examStats ? `${examStats.upToDate} de ${examStats.total} exámenes` : "Cargando..."}
            icon={Stethoscope}
            variant={examStats && examStats.percentage >= 80 ? "success" : "warning"}
          />
          <StatCard
            title="Cursos Completados"
            value={courseStats ? `${courseStats.percentage}%` : "-"}
            subtitle={courseStats ? `${courseStats.expired} vencidos` : "Cargando..."}
            icon={GraduationCap}
            variant={courseStats && courseStats.percentage >= 80 ? "success" : "warning"}
          />
          <StatCard
            title="Alertas Pendientes"
            value={notificationStats?.unread ?? "-"}
            subtitle={`${notificationStats?.urgent ?? 0} urgentes`}
            icon={ShieldCheck}
            variant={notificationStats && notificationStats.urgent > 0 ? "warning" : "default"}
          />
        </div>

        {/* Stats grid - Row 2 */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Vigilancias Activas"
            value={vigilanciaStats?.active ?? "-"}
            subtitle={`${vigilanciaStats?.expired ?? 0} vencidas`}
            icon={FileSignature}
            variant={vigilanciaStats && vigilanciaStats.expired > 0 ? "danger" : "default"}
          />
          <StatCard
            title="Evaluaciones"
            value={evalStats?.pending ?? "-"}
            subtitle={`${evalStats?.total ?? 0} en total`}
            icon={ClipboardCheck}
            variant={evalStats && evalStats.pending > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Comunicaciones"
            value={commStats?.sentThisMonth ?? "-"}
            subtitle="Enviadas este mes"
            icon={Mail}
          />
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Alerts */}
          <div className="lg:col-span-2">
            <AlertList />
          </div>

          {/* Right column - Quick actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Second row */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Upcoming deadlines */}
          <div className="lg:col-span-2">
            <UpcomingDeadlines />
          </div>

          {/* Compliance chart */}
          <div>
            <ComplianceChart />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
