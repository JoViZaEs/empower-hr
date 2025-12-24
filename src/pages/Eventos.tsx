import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  FileSignature,
  Users,
  CheckCircle,
  Clock,
  Calendar,
  Mail,
} from "lucide-react";

const events = [
  {
    id: "1",
    title: "Inducción General SST",
    type: "induction",
    date: "20 Dic 2024",
    participants: 12,
    signed: 8,
    status: "in_progress",
  },
  {
    id: "2",
    title: "Reinducción Anual 2024",
    type: "reinduction",
    date: "15 Dic 2024",
    participants: 156,
    signed: 148,
    status: "in_progress",
  },
  {
    id: "3",
    title: "Capacitación Trabajo en Alturas",
    type: "training",
    date: "10 Dic 2024",
    participants: 25,
    signed: 25,
    status: "completed",
  },
  {
    id: "4",
    title: "Reunión COPASST Diciembre",
    type: "meeting",
    date: "05 Dic 2024",
    participants: 8,
    signed: 8,
    status: "completed",
  },
];

const pendingSignatures = [
  { id: "1", employee: "Juan Carlos Rodríguez", event: "Inducción General SST", daysAgo: 5 },
  { id: "2", employee: "María García López", event: "Inducción General SST", daysAgo: 5 },
  { id: "3", employee: "Pedro Ramírez", event: "Reinducción Anual 2024", daysAgo: 10 },
  { id: "4", employee: "Sandra López", event: "Inducción General SST", daysAgo: 5 },
];

const typeBadges = {
  induction: { label: "Inducción", className: "bg-primary/10 text-primary border-primary/20" },
  reinduction: { label: "Reinducción", className: "bg-info/10 text-info border-info/20" },
  training: { label: "Capacitación", className: "bg-success/10 text-success border-success/20" },
  meeting: { label: "Reunión", className: "bg-warning/10 text-warning border-warning/20" },
};

export default function Eventos() {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Eventos y Firmas</h1>
            <p className="mt-1 text-muted-foreground">
              Gestión de eventos con recolección de firmas digitales
            </p>
          </div>
          <Button className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Crear Evento
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <FileSignature className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-muted-foreground">Eventos activos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-success/10 p-3 text-success">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">189</p>
              <p className="text-sm text-muted-foreground">Firmas recolectadas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-warning/10 p-3 text-warning">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Firmas pendientes</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-info/10 p-3 text-info">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">201</p>
              <p className="text-sm text-muted-foreground">Participantes totales</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Events list */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="in_progress">En progreso</TabsTrigger>
                <TabsTrigger value="completed">Completados</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {events.map((event) => {
                  const typeInfo = typeBadges[event.type as keyof typeof typeBadges];
                  const progress = Math.round((event.signed / event.participants) * 100);

                  return (
                    <Card key={event.id} className="card-interactive">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              <Badge className={typeInfo.className}>{typeInfo.label}</Badge>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {event.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.participants} participantes
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{progress}%</p>
                            <p className="text-xs text-muted-foreground">completado</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Firmas recolectadas</span>
                            <span className="font-medium">
                              {event.signed} de {event.participants}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        {event.status === "in_progress" && (
                          <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm">
                              Ver detalles
                            </Button>
                            <Button size="sm">
                              <Mail className="mr-2 h-3 w-3" />
                              Enviar recordatorio
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="in_progress">
                <p className="text-muted-foreground">Eventos en progreso...</p>
              </TabsContent>
              <TabsContent value="completed">
                <p className="text-muted-foreground">Eventos completados...</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pending signatures */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  Firmas Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingSignatures.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3"
                    >
                      <div>
                        <p className="font-medium">{item.employee}</p>
                        <p className="text-xs text-muted-foreground">{item.event}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Hace {item.daysAgo} días
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar recordatorios masivos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
