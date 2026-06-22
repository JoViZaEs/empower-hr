import { useQuery, useQueryClient } from '@tanstack/react-query';
import { portalSupabase } from '@/integrations/supabase/portalClient';
import { useEmployeePortalAuth } from '@/hooks/useEmployeePortalAuth';
import { EmployeePortalLayout } from '@/components/portal/EmployeePortalLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export default function PortalReglamento() {
  const { employee } = useEmployeePortalAuth();
  const eid = employee?.id;
  const qc = useQueryClient();

  const { data: regs } = useQuery({
    queryKey: ['portal-regulations', employee?.tenant_id],
    enabled: !!employee,
    queryFn: async () => {
      const { data } = await portalSupabase.from('regulations').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: acks } = useQuery({
    queryKey: ['portal-acks', eid],
    enabled: !!eid,
    queryFn: async () => {
      const { data } = await portalSupabase.from('regulation_acknowledgments').select('regulation_id, acknowledged_at').eq('employee_id', eid!);
      return data || [];
    },
  });

  return (
    <EmployeePortalLayout>
      <h1 className="text-2xl font-bold">Reglamento Interno</h1>
      <div className="space-y-3">
        {regs?.map((r: any) => {
          const ack = acks?.find((a) => a.regulation_id === r.id);
          return <RegItem key={r.id} reg={r} ack={ack} onAck={() => qc.invalidateQueries({ queryKey: ['portal-acks', eid] })} employeeId={eid!} tenantId={employee!.tenant_id} />;
        })}
        {regs?.length === 0 && <p className="text-muted-foreground">No hay reglamentos publicados.</p>}
      </div>
    </EmployeePortalLayout>
  );
}

function RegItem({ reg, ack, onAck, employeeId, tenantId }: any) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setScrolled(true);
  };

  const handleAck = async () => {
    setBusy(true);
    try {
      const { error } = await portalSupabase.from('regulation_acknowledgments').insert({
        regulation_id: reg.id, employee_id: employeeId, tenant_id: tenantId,
        acknowledged_at: new Date().toISOString(), status: 'acknowledged',
      });
      if (error) throw error;
      toast.success('Reglamento marcado como leído');
      onAck();
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'No fue posible registrar');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{reg.title} <span className="text-sm text-muted-foreground">v{reg.version}</span></p>
        </div>
        {ack ? <span className="text-sm text-green-600 font-medium">✓ Leído el {new Date(ack.acknowledged_at).toLocaleDateString()}</span> :
          <Button size="sm" onClick={() => setOpen((o) => !o)}>{open ? 'Cerrar' : 'Leer'}</Button>}
      </div>
      {open && (
        <div>
          <div ref={ref} onScroll={handleScroll} className="max-h-72 overflow-y-auto border rounded p-3 text-sm whitespace-pre-wrap">
            {reg.content || 'Sin contenido.'}
          </div>
          <Button className="mt-3 w-full" disabled={!scrolled || busy} onClick={handleAck}>
            {scrolled ? 'Marcar como leído' : 'Desplaza hasta el final para habilitar'}
          </Button>
        </div>
      )}
    </Card>
  );
}
