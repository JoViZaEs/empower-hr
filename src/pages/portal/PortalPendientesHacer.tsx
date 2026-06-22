import { EmployeePortalLayout } from '@/components/portal/EmployeePortalLayout';
import { Card } from '@/components/ui/card';

export default function PortalPendientesHacer() {
  return (
    <EmployeePortalLayout>
      <h1 className="text-2xl font-bold">Pendientes por hacer</h1>
      <Card className="p-6 text-muted-foreground">
        Próximamente: cursos sin completar, evaluaciones por responder y eventos por confirmar.
      </Card>
    </EmployeePortalLayout>
  );
}
