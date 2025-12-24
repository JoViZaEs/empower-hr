import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, Calendar, Award, AlertTriangle } from "lucide-react";

const committees = [
  {
    id: "1",
    name: "COPASST",
    description: "Comité Paritario de Seguridad y Salud en el Trabajo",
    startDate: "01 Ene 2024",
    endDate: "31 Dic 2025",
    daysLeft: 372,
    members: [
      { name: "María García", role: "Presidente", initials: "MG" },
      { name: "Juan Rodríguez", role: "Secretario", initials: "JR" },
      { name: "Ana Pérez", role: "Miembro", initials: "AP" },
      { name: "Carlos Martínez", role: "Miembro", initials: "CM" },
    ],
    trainings: { completed: 4, total: 6 },
    status: "active",
  },
  {
    id: "2",
    name: "Comité de Convivencia",
    description: "Comité de Convivencia Laboral",
    startDate: "15 Mar 2024",
    endDate: "15 Mar 2026",
    daysLeft: 446,
    members: [
      { name: "Laura González", role: "Presidente", initials: "LG" },
      { name: "Pedro Ramírez", role: "Secretario", initials: "PR" },
      { name: "Sandra López", role: "Miembro", initials: "SL" },
    ],
    trainings: { completed: 2, total: 4 },
    status: "active",
  },
  {
    id: "3",
    name: "Brigada de Emergencias",
    description: "Equipo de respuesta ante emergencias",
    startDate: "01 Jun 2023",
    endDate: "01 Jun 2024",
    daysLeft: 0,
    members: [
      { name: "Diego Torres", role: "Coordinador", initials: "DT" },
      { name: "Lucía Herrera", role: "Sub-coordinador", initials: "LH" },
    ],
    trainings: { completed: 3, total: 3 },
    status: "expired",
  },
];

export default function Comites() {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Comités</h1>
            <p className="mt-1 text-muted-foreground">
              Gestión de comités y brigadas de la organización
            </p>
          </div>
          <Button className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Comité
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Comités registrados</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-success/20 bg-success/5 p-4 shadow-card">
            <div className="rounded-lg bg-success/10 p-3 text-success">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm text-muted-foreground">Vigentes</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4 shadow-card">
            <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-muted-foreground">Vencido</p>
            </div>
          </div>
        </div>

        {/* Committee cards */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {committees.map((committee) => (
            <Card key={committee.id} className="card-interactive">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{committee.name}</CardTitle>
                    <CardDescription className="mt-1">{committee.description}</CardDescription>
                  </div>
                  {committee.status === "active" ? (
                    <Badge className="bg-success/10 text-success border-success/20">Vigente</Badge>
                  ) : (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20">Vencido</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dates */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {committee.startDate} - {committee.endDate}
                  </span>
                  {committee.daysLeft > 0 && (
                    <Badge variant="outline" className="ml-auto">
                      {committee.daysLeft} días
                    </Badge>
                  )}
                </div>

                {/* Members */}
                <div>
                  <p className="mb-2 text-sm font-medium">Miembros</p>
                  <div className="flex -space-x-2">
                    {committee.members.slice(0, 4).map((member, index) => (
                      <Avatar key={index} className="border-2 border-card">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {committee.members.length > 4 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium">
                        +{committee.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Training progress */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Capacitaciones</span>
                    <span className="font-medium">
                      {committee.trainings.completed}/{committee.trainings.total}
                    </span>
                  </div>
                  <Progress
                    value={(committee.trainings.completed / committee.trainings.total) * 100}
                    className="h-2"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver detalles
                  </Button>
                  <Button size="sm" className="flex-1">
                    Gestionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
