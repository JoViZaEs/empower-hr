import { useQuery } from '@tanstack/react-query';
import { portalSupabase } from '@/integrations/supabase/portalClient';
import { useEmployeePortalAuth } from '@/hooks/useEmployeePortalAuth';
import { EmployeePortalLayout } from '@/components/portal/EmployeePortalLayout';
import { Card } from '@/components/ui/card';

export default function PortalDesprendibles() {
  const { employee } = useEmployeePortalAuth();
  const eid = employee?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['portal-payroll', eid],
    enabled: !!eid,
    queryFn: async () => {
      const { data } = await portalSupabase
        .from('payroll_records')
        .select('id, payment_date, net_pay, total_earnings, total_deductions, status')
        .eq('employee_id', eid!)
        .order('payment_date', { ascending: false });
      return data || [];
    },
  });

  return (
    <EmployeePortalLayout>
      <h1 className="text-2xl font-bold">Mis desprendibles de pago</h1>
      {isLoading ? <p className="text-muted-foreground">Cargando...</p> : data?.length === 0 ? (
        <p className="text-muted-foreground">Aún no tienes desprendibles registrados.</p>
      ) : (
        <div className="space-y-3">
          {data?.map((r) => (
            <Card key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.payment_date}</p>
                <p className="text-sm text-muted-foreground">Devengado: ${Number(r.total_earnings ?? 0).toLocaleString('es-CO')} · Deducciones: ${Number(r.total_deductions ?? 0).toLocaleString('es-CO')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">${Number(r.net_pay ?? 0).toLocaleString('es-CO')}</p>
                <p className="text-xs text-muted-foreground">{r.status}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </EmployeePortalLayout>
  );
}
