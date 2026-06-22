import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { portalSupabase } from '@/integrations/supabase/portalClient';
import { useEmployeePortalAuth } from '@/hooks/useEmployeePortalAuth';
import { EmployeePortalLayout } from '@/components/portal/EmployeePortalLayout';
import { Card } from '@/components/ui/card';
import { PenTool, ClipboardList, DollarSign, Award } from 'lucide-react';

export default function PortalDashboard() {
  const { employee } = useEmployeePortalAuth();
  const eid = employee?.id;

  const { data: counts } = useQuery({
    queryKey: ['portal-dashboard-counts', eid],
    enabled: !!eid,
    queryFn: async () => {
      const [signDot, ackPending, lastPayroll] = await Promise.all([
        portalSupabase.from('dotacion').select('id', { count: 'exact', head: true }).eq('employee_id', eid!).is('signature_url', null),
        portalSupabase.from('regulations').select('id', { count: 'exact', head: true }),
        portalSupabase.from('payroll_records').select('payment_date, net_pay').eq('employee_id', eid!).order('payment_date', { ascending: false }).limit(1).maybeSingle(),
      ]);
      return {
        pendingSign: signDot.count ?? 0,
        regulations: ackPending.count ?? 0,
        lastPayroll: lastPayroll.data,
      };
    },
  });

  return (
    <EmployeePortalLayout>
      <h1 className="text-2xl font-bold">Hola, {employee?.first_name} 👋</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashCard to="/Funcionarios/pendientes/firmar" icon={PenTool} label="Por firmar" value={counts?.pendingSign ?? '—'} />
        <DashCard to="/Funcionarios/pendientes/hacer" icon={ClipboardList} label="Por hacer" value={counts?.regulations ?? '—'} />
        <DashCard to="/Funcionarios/desprendibles" icon={DollarSign} label="Último desprendible" value={counts?.lastPayroll?.payment_date ?? 'Sin registros'} />
        <DashCard to="/Funcionarios/certificados" icon={Award} label="Certificados" value="Ver" />
      </div>
    </EmployeePortalLayout>
  );
}

function DashCard({ to, icon: Icon, label, value }: { to: string; icon: any; label: string; value: any }) {
  return (
    <Link to={to}>
      <Card className="p-5 hover:shadow-md transition flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{String(value)}</p>
        </div>
      </Card>
    </Link>
  );
}
