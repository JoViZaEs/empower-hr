import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { KeyRound, ShieldOff, UserPlus, RotateCw, Loader2 } from 'lucide-react';

interface Props { employeeId: string; documentNumber: string; }

type Action = null | 'create' | 'reset' | 'revoke';

export function PortalAccountActions({ employeeId, documentNumber }: Props) {
  const qc = useQueryClient();
  const [pending, setPending] = useState<Action>(null);
  const [busy, setBusy] = useState(false);

  const { data: account, isLoading } = useQuery({
    queryKey: ['portal-account', employeeId],
    queryFn: async () => {
      const { data } = await supabase
        .from('employee_portal_accounts')
        .select('id, status, must_change_password, last_login_at, activated_at, revoked_at')
        .eq('employee_id', employeeId)
        .maybeSingle();
      return data;
    },
  });

  const invoke = async (fn: string) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body: { employee_id: employeeId } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success((data as any)?.message || 'Listo');
      qc.invalidateQueries({ queryKey: ['portal-account', employeeId] });
      qc.invalidateQueries({ queryKey: ['portal-accounts-list'] });
    } catch (e: any) {
      toast.error(e?.message || 'Error');
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const status = account?.status;
  const hasAccount = !!account;
  const isActive = status === 'active';

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold">Acceso al portal del empleado</p>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Cargando…' :
              !hasAccount ? 'Sin cuenta creada' :
              isActive ? `Activo${account.must_change_password ? ' · debe cambiar contraseña' : ''}${account.last_login_at ? ` · último ingreso ${new Date(account.last_login_at).toLocaleDateString()}` : ''}` :
              `Revocado el ${account.revoked_at ? new Date(account.revoked_at).toLocaleDateString() : ''}`}
          </p>
        </div>
        <Badge variant={isActive ? 'default' : hasAccount ? 'destructive' : 'secondary'}>
          {isActive ? 'Activo' : hasAccount ? 'Revocado' : 'Sin cuenta'}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {!isActive && (
          <Button size="sm" onClick={() => setPending('create')} disabled={busy}>
            {hasAccount ? <><RotateCw className="h-4 w-4 mr-2" />Reactivar</> : <><UserPlus className="h-4 w-4 mr-2" />Activar acceso</>}
          </Button>
        )}
        {isActive && (
          <>
            <Button size="sm" variant="outline" onClick={() => setPending('reset')} disabled={busy}>
              <KeyRound className="h-4 w-4 mr-2" />Resetear clave
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setPending('revoke')} disabled={busy}>
              <ShieldOff className="h-4 w-4 mr-2" />Revocar acceso
            </Button>
          </>
        )}
        {busy && <Loader2 className="h-4 w-4 animate-spin self-center" />}
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending === 'create' && (hasAccount ? 'Reactivar acceso al portal' : 'Activar acceso al portal')}
              {pending === 'reset' && 'Resetear contraseña'}
              {pending === 'revoke' && 'Revocar acceso al portal'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending === 'create' && <>Se creará la cuenta con usuario <b>{documentNumber}</b> y contraseña <b>{documentNumber}</b>. El empleado deberá cambiarla al ingresar.</>}
              {pending === 'reset' && <>La contraseña se restablecerá a <b>{documentNumber}</b>. El empleado deberá cambiarla en su próximo ingreso.</>}
              {pending === 'revoke' && <>Se eliminará el usuario y el empleado no podrá ingresar más al portal hasta que vuelvas a activarlo.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (pending === 'create') invoke('portal-account-create');
              else if (pending === 'reset') invoke('portal-account-reset-password');
              else if (pending === 'revoke') invoke('portal-account-revoke');
            }}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
