import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { EventoForm } from "@/components/eventos/EventoForm";
import { EventoDetailDialog } from "@/components/eventos/EventoDetailDialog";
import {
  Plus,
  FileSignature,
  Users,
  CheckCircle,
  Clock,
  Calendar,
  Mail,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusLabels: Record<string, { label: string; className: string }> = {
  borrador: { label: "Borrador", className: "bg-muted text-muted-foreground" },
  en_progreso: { label: "En progreso", className: "bg-primary/10 text-primary border-primary/20" },
  completado: { label: "Completado", className: "bg-success/10 text-success border-success/20" },
  cancelado: { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export default function Eventos() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [detailEvent, setDetailEvent] = useState<{ id: string; title: string } | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events" as any)
        .select("*, participants:event_participants(id, signed, employee:employees(id, first_name, last_name))")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Evento eliminado");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err) => toast.error("Error: " + err.message),
  });

  // Stats
  const activeEvents = events?.filter((e) => e.status === "en_progreso").length || 0;
  const totalParticipants = events?.reduce((sum, e) => sum + (e.participants?.length || 0), 0) || 0;
  const totalSigned = events?.reduce(
    (sum, e) => sum + (e.participants?.filter((p: any) => p.signed).length || 0), 0
  ) || 0;
  const totalPending = totalParticipants - totalSigned;

  // Pending signatures for sidebar
  const pendingSignatures = events
    ?.flatMap((e) =>
      (e.participants || [])
        .filter((p: any) => !p.signed)
        .map((p: any) => ({
          id: p.id,
          employee: p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : "Desconocido",
          event: e.title,
        }))
    )
    ?.slice(0, 8) || [];

  const handleEdit = (event: any) => {
    setEditData({
      id: event.id,
      title: event.title,
      event_type: event.event_type,
      event_date: event.event_date,
      description: event.description,
      location: event.location,
      status: event.status,
    });
    setFormOpen(true);
  };

  const filterEvents = (status?: string) => {
    if (!events) return [];
    if (!status) return events;
    return events.filter((e) => e.status === status);
  };

  const renderEventCard = (event: any) => {
    const participantCount = event.participants?.length || 0;
    const signedCount = event.participants?.filter((p: any) => p.signed).length || 0;
    const progress = participantCount > 0 ? Math.round((signedCount / participantCount) * 100) : 0;
    const sInfo = statusLabels[event.status] || statusLabels.borrador;

    return (
      <Card key={event.id} className="card-interactive">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{event.title}</h3>
                <Badge className={sInfo.className}>{sInfo.label}</Badge>
                <Badge variant="outline">{event.event_type}</Badge>
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(event.event_date + "T12:00:00"), "d MMM yyyy", { locale: es })}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {participantCount} participantes
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{progress}%</p>
              <p className="text-xs text-muted-foreground">firmado</p>
            </div>
          </div>

          {participantCount > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Firmas recolectadas</span>
                <span className="font-medium">{signedCount} de {participantCount}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="mt-4 flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailEvent({ id: event.id, title: event.title })}
            >
              Ver detalles
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
              <Pencil className="mr-1 h-3 w-3" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => {
                if (confirm("¿Eliminar este evento?")) deleteMutation.mutate(event.id);
              }}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Eventos y Firmas</h1>
            <p className="mt-1 text-muted-foreground">
              Gestión de eventos con recolección de firmas digitales
            </p>
          </div>
          <Button className="gradient-primary" onClick={() => { setEditData(null); setFormOpen(true); }}>
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
              <p className="text-2xl font-bold">{activeEvents}</p>
              <p className="text-sm text-muted-foreground">Eventos activos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-success/10 p-3 text-success">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSigned}</p>
              <p className="text-sm text-muted-foreground">Firmas recolectadas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-warning/10 p-3 text-warning">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPending}</p>
              <p className="text-sm text-muted-foreground">Firmas pendientes</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-info/10 p-3 text-info">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalParticipants}</p>
              <p className="text-sm text-muted-foreground">Participantes totales</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">Todos ({events?.length || 0})</TabsTrigger>
                  <TabsTrigger value="en_progreso">En progreso ({filterEvents("en_progreso").length})</TabsTrigger>
                  <TabsTrigger value="completado">Completados ({filterEvents("completado").length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {filterEvents().length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay eventos registrados</p>
                  ) : filterEvents().map(renderEventCard)}
                </TabsContent>

                <TabsContent value="en_progreso" className="space-y-4">
                  {filterEvents("en_progreso").length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay eventos en progreso</p>
                  ) : filterEvents("en_progreso").map(renderEventCard)}
                </TabsContent>

                <TabsContent value="completado" className="space-y-4">
                  {filterEvents("completado").length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay eventos completados</p>
                  ) : filterEvents("completado").map(renderEventCard)}
                </TabsContent>
              </Tabs>
            </div>

            {/* Pending signatures sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-warning" />
                    Firmas Pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingSignatures.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay firmas pendientes
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {pendingSignatures.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border border-warning/20 bg-warning/5 p-3"
                        >
                          <div>
                            <p className="font-medium text-sm">{item.employee}</p>
                            <p className="text-xs text-muted-foreground">{item.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <EventoForm
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditData(null); }}
        editData={editData}
      />

      {detailEvent && (
        <EventoDetailDialog
          open={!!detailEvent}
          onOpenChange={(open) => { if (!open) setDetailEvent(null); }}
          eventId={detailEvent.id}
          eventTitle={detailEvent.title}
        />
      )}
    </MainLayout>
  );
}
