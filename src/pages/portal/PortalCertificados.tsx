import { EmployeePortalLayout } from '@/components/portal/EmployeePortalLayout';
import { Card } from '@/components/ui/card';

export default function PortalCertificados() {
  return (
    <EmployeePortalLayout>
      <h1 className="text-2xl font-bold">Mis certificados</h1>
      <Card className="p-6 text-muted-foreground">
        Próximamente podrás generar y descargar tus certificados laborales.
      </Card>
    </EmployeePortalLayout>
  );
}
