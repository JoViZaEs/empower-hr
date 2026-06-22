import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PortalAccountActions } from '@/components/portal/PortalAccountActions';

export function PortalAccountsSettings() {
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['portal-accounts-list'],
    queryFn: async () => {
      const { data: emps } = await supabase
        .from('employees')
        .select('id, first_name, last_name, document_number, position, active')
        .order('first_name');
      const { data: accs } = await supabase
        .from('employee_portal_accounts')
        .select('employee_id, status, last_login_at, must_change_password');
      const byId = new Map((accs || []).map((a) => [a.employee_id, a]));
      return (emps || []).map((e) => ({ ...e, account: byId.get(e.id) }));
    },
  });

  const filtered = (data || []).filter((r) => {
    const t = q.toLowerCase();
    return !t || r.first_name?.toLowerCase().includes(t) || r.last_name?.toLowerCase().includes(t) || r.document_number?.toLowerCase().includes(t);
  });

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Portal del Empleado</h2>
          <p className="text-sm text-muted-foreground">Activa, resetea o revoca el acceso de cada empleado al portal /Funcionarios.</p>
        </div>
        <Input placeholder="Buscar por nombre o documento..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Último ingreso</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5}>Cargando…</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={5}>Sin resultados</TableCell></TableRow>}
            {filtered.map((r) => {
              const status = r.account?.status;
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.first_name} {r.last_name}</div>
                    <div className="text-xs text-muted-foreground">{r.position || '—'}</div>
                  </TableCell>
                  <TableCell className="font-mono">{r.document_number}</TableCell>
                  <TableCell>
                    {!r.account && <Badge variant="secondary">Sin cuenta</Badge>}
                    {status === 'active' && <Badge>Activo</Badge>}
                    {status === 'revoked' && <Badge variant="destructive">Revocado</Badge>}
                  </TableCell>
                  <TableCell>{r.account?.last_login_at ? new Date(r.account.last_login_at).toLocaleString() : '—'}</TableCell>
                  <TableCell>
                    <PortalAccountActions employeeId={r.id} documentNumber={r.document_number} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
