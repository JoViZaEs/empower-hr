import { EmployeePortalLayout } from '@/components/portal/EmployeePortalLayout';
import { useEmployeePortalAuth } from '@/hooks/useEmployeePortalAuth';
import { Card } from '@/components/ui/card';

export default function PortalPerfil() {
  const { employee } = useEmployeePortalAuth();
  return (
    <EmployeePortalLayout>
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      <Card className="p-6 space-y-2">
        <Row label="Nombre" value={`${employee?.first_name} ${employee?.last_name}`} />
        <Row label="Documento" value={employee?.document_number} />
        <Row label="Correo" value={employee?.email || '—'} />
        <Row label="Cargo" value={employee?.position || '—'} />
        <Row label="Área" value={employee?.department || '—'} />
      </Card>
    </EmployeePortalLayout>
  );
}
function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b last:border-0 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
