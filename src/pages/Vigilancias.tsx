import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, ShieldCheck, Users, AlertTriangle, CheckCircle } from "lucide-react";

const vigilances = [
  {
    id: "1",
    name: "Riesgo Cardiovascular",
    description: "Control periódico para empleados con factores de riesgo cardiovascular",
    totalEmployees: 45,
    compliant: 38,
    pending: 5,
    expired: 2,
    frequency: "Anual",
  },
  {
    id: "2",
    name: "Conservación Auditiva",
    description: "Seguimiento a empleados expuestos a ruido ocupacional",
    totalEmployees: 28,
    compliant: 25,
    pending: 2,
    expired: 1,
    frequency: "Semestral",
  },
  {
    id: "3",
    name: "Osteomuscular",
    description: "Prevención de lesiones musculoesqueléticas",
    totalEmployees: 67,
    compliant: 60,
    pending: 7,
    expired: 0,
    frequency: "Anual",
  },
  {
    id: "4",
    name: "Riesgo Químico",
    description: "Control de exposición a sustancias químicas",
    totalEmployees: 15,
    compliant: 12,
    pending: 3,
    expired: 0,
    frequency: "Semestral",
  },
];

export default function Vigilancias() {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vigilancias Epidemiológicas</h1>
            <p className="mt-1 text-muted-foreground">
              Control y seguimiento de programas de vigilancia en salud
            </p>
          </div>
          <Button className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Vigilancia
          </Button>
        </div>

        {/* Stats summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-muted-foreground">Programas activos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-success/10 p-3 text-success">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">135</p>
              <p className="text-sm text-muted-foreground">Al día</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-warning/10 p-3 text-warning">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">17</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Vencidos</p>
            </div>
          </div>
        </div>

        {/* Vigilance cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {vigilances.map((vigilance) => {
            const complianceRate = Math.round((vigilance.compliant / vigilance.totalEmployees) * 100);
            
            return (
              <Card key={vigilance.id} className="card-interactive">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{vigilance.name}</CardTitle>
                      <CardDescription className="mt-1">{vigilance.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{vigilance.frequency}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cumplimiento</span>
                      <span className="font-medium">{complianceRate}%</span>
                    </div>
                    <Progress value={complianceRate} className="h-2" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <span className="text-muted-foreground">Al día:</span>
                      <span className="font-medium">{vigilance.compliant}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-warning" />
                      <span className="text-muted-foreground">Pendientes:</span>
                      <span className="font-medium">{vigilance.pending}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-destructive" />
                      <span className="text-muted-foreground">Vencidos:</span>
                      <span className="font-medium">{vigilance.expired}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver empleados
                    </Button>
                    <Button size="sm" className="flex-1">
                      Gestionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
