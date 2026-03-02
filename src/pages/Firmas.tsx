import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SignatureDialog } from "@/components/firmas/SignatureDialog";
import {
  PenTool,
  CheckCircle,
  Clock,
  Loader2,
  FileSignature,
  Shirt,
  Calendar,
  ClipboardCheck,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PendingSignature {
  id: string;
  module: string;
  recordId: string;
  employeeId: string;
  employeeName: string;
  source: string;
  date: string;
}

const moduleLabels: Record<string, { label: string; icon: any; className: string }> = {
  eventos: { label: "Eventos", icon: Calendar, className: "bg-primary/10 text-primary" },
  dotacion: { label: "Dotación", icon: Shirt, className: "bg-warning/10 text-warning" },
  evaluaciones_desempeno: { label: "Eval. Desempeño", icon: ClipboardCheck, className: "bg-info/10 text-info" },
};

export default function Firmas() {
  const { profile } = useAuth();
  const [signatureTarget, setSignatureTarget] = useState<PendingSignature | null>(null);

  // Fetch pending event signatures
  const { data: eventPending, isLoading: loadingEvents } = useQuery({
    queryKey: ["pending-signatures-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_participants" as any)
        .select("id, event_id, signed, employee:employees(id, first_name, last_name), event:events(title, event_date)")
        .eq("signed", false);
      if (error) throw error;
      return (data as any[]).map((p) => ({
        id: p.id,
        module: "eventos",
        recordId: p.id,
        employeeId: p.employee?.id,
        employeeName: p.employee ? `${p.employee.first_name} ${p.employee.last_name}` : "Desconocido",
        source: p.event?.title || "Evento",
        date: p.event?.event_date || "",
      }));
    },
  });

  // Fetch pending dotacion signatures
  const { data: dotacionPending, isLoading: loadingDotacion } = useQuery({
    queryKey: ["pending-signatures-dotacion"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dotacion")
        .select("id, item_name, delivery_date, employee_id, employees(id, first_name, last_name)")
        .is("signature_url", null);
      if (error) throw error;
      return (data as any[]).map((d) => ({
        id: d.id,
        module: "dotacion",
        recordId: d.id,
        employeeId: d.employees?.id || d.employee_id,
        employeeName: d.employees ? `${d.employees.first_name} ${d.employees.last_name}` : "Desconocido",
        source: d.item_name,
        date: d.delivery_date || "",
      }));
    },
  });

  // Fetch completed signatures
  const { data: completedSignatures, isLoading: loadingCompleted } = useQuery({
    queryKey: ["completed-signatures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signatures" as any)
        .select("*, employee:employees(first_name, last_name)")
        .order("signed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as any[];
    },
  });

  const allPending = [...(eventPending || []), ...(dotacionPending || [])];
  const isLoading = loadingEvents || loadingDotacion;

  const pendingByModule = (mod: string) => allPending.filter((p) => p.module === mod);

  const stats = {
    total: allPending.length,
    eventos: pendingByModule("eventos").length,
    dotacion: pendingByModule("dotacion").length,
    completed: completedSignatures?.length || 0,
  };

  const renderPendingCard = (item: PendingSignature) => {
    const modInfo = moduleLabels[item.module] || moduleLabels.eventos;
    const ModIcon = modInfo.icon;
    return (
      <div
        key={`${item.module}-${item.id}`}
        className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${modInfo.className}`}>
            <ModIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-sm">{item.employeeName}</p>
            <p className="text-xs text-muted-foreground">{item.source}</p>
            {item.date && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(item.date + "T12:00:00"), "d MMM yyyy", { locale: es })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {modInfo.label}
          </Badge>
          <Button
            size="sm"
            onClick={() => setSignatureTarget(item)}
          >
            <PenTool className="mr-1 h-3 w-3" />
            Firmar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Centro de Firmas</h1>
          <p className="mt-1 text-muted-foreground">
            Gestión centralizada de todas las firmas pendientes del sistema
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-warning/10 p-3 text-warning">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Pendientes totales</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.eventos}</p>
              <p className="text-sm text-muted-foreground">Eventos</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-warning/10 p-3 text-warning">
              <Shirt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.dotacion}</p>
              <p className="text-sm text-muted-foreground">Dotación</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-success/10 p-3 text-success">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Firmas registradas</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todas ({allPending.length})</TabsTrigger>
              <TabsTrigger value="eventos">Eventos ({stats.eventos})</TabsTrigger>
              <TabsTrigger value="dotacion">Dotación ({stats.dotacion})</TabsTrigger>
              <TabsTrigger value="completed">Completadas ({stats.completed})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {allPending.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="mx-auto mb-3 h-12 w-12 text-success/50" />
                    <p className="text-muted-foreground">No hay firmas pendientes</p>
                  </CardContent>
                </Card>
              ) : (
                allPending.map(renderPendingCard)
              )}
            </TabsContent>

            <TabsContent value="eventos" className="space-y-3">
              {pendingByModule("eventos").length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Sin firmas de eventos pendientes</p>
              ) : (
                pendingByModule("eventos").map(renderPendingCard)
              )}
            </TabsContent>

            <TabsContent value="dotacion" className="space-y-3">
              {pendingByModule("dotacion").length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Sin firmas de dotación pendientes</p>
              ) : (
                pendingByModule("dotacion").map(renderPendingCard)
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3">
              {loadingCompleted ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !completedSignatures || completedSignatures.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Sin firmas registradas aún</p>
              ) : (
                completedSignatures.map((s: any) => {
                  const modInfo = moduleLabels[s.module] || moduleLabels.eventos;
                  const ModIcon = modInfo.icon;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`rounded-lg p-2 bg-success/10 text-success`}>
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {s.employee ? `${s.employee.first_name} ${s.employee.last_name}` : "Empleado"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.signed_at && format(new Date(s.signed_at), "d MMM yyyy HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{modInfo.label}</Badge>
                        <Badge className="text-xs bg-success/10 text-success border-success/20">
                          {s.method === "canvas" ? "Canvas" : "Confirmación"}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {signatureTarget && profile?.tenant_id && (
        <SignatureDialog
          open={!!signatureTarget}
          onOpenChange={(open) => { if (!open) setSignatureTarget(null); }}
          module={signatureTarget.module}
          recordId={signatureTarget.recordId}
          employeeId={signatureTarget.employeeId}
          employeeName={signatureTarget.employeeName}
          tenantId={profile.tenant_id}
        />
      )}
    </MainLayout>
  );
}
