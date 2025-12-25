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

export default function Dashboard() {
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
            value={156}
            subtitle="12 nuevos este mes"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Exámenes al Día"
            value="92%"
            subtitle="144 de 156 empleados"
            icon={Stethoscope}
            variant="success"
          />
          <StatCard
            title="Cursos Vigentes"
            value="87%"
            subtitle="8 por renovar"
            icon={GraduationCap}
            variant="success"
          />
          <StatCard
            title="Alertas Pendientes"
            value={7}
            subtitle="3 urgentes"
            icon={ShieldCheck}
            variant="warning"
          />
        </div>

        {/* Stats grid - Row 2 */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Firmas Pendientes"
            value={8}
            subtitle="De reinducción SST"
            icon={FileSignature}
            variant="danger"
          />
          <StatCard
            title="Eval. Desempeño"
            value={4}
            subtitle="En proceso este período"
            icon={ClipboardCheck}
          />
          <StatCard
            title="Brechas Competencias"
            value={3}
            subtitle="Requieren atención"
            icon={Target}
            variant="warning"
          />
          <StatCard
            title="Comunicaciones"
            value={12}
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
