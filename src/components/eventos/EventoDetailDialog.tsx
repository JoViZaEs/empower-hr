import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, CheckCircle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EventoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
}

export function EventoDetailDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
}: EventoDetailDialogProps) {
  const queryClient = useQueryClient();
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const { data: participants, isLoading } = useQuery({
    queryKey: ["event-participants", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_participants" as any)
        .select(`*, employee:employees(id, first_name, last_name, position)`)
        .eq("event_id", eventId)
        .order("invited_at");
      if (error) throw error;
      return data as any[];
    },
    enabled: open,
  });

  const { data: employees } = useQuery({
    queryKey: ["employees-for-event-detail"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("active", true)
        .order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: open && showAddParticipant,
  });

  const addParticipantMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("event_participants" as any)
        .insert({ event_id: eventId, employee_id: selectedEmployee });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Participante agregado");
      queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowAddParticipant(false);
      setSelectedEmployee("");
    },
    onError: (err) => toast.error("Error: " + err.message),
  });

  const toggleSignatureMutation = useMutation({
    mutationFn: async ({ participantId, signed }: { participantId: string; signed: boolean }) => {
      const { error } = await supabase
        .from("event_participants" as any)
        .update({
          signed,
          signed_at: signed ? new Date().toISOString() : null,
        })
        .eq("id", participantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-participants", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Firma actualizada");
    },
    onError: (err) => toast.error("Error: " + err.message),
  });

  const totalParticipants = participants?.length || 0;
  const signedCount = participants?.filter((p) => p.signed).length || 0;
  const progress = totalParticipants > 0 ? Math.round((signedCount / totalParticipants) * 100) : 0;

  const existingEmployeeIds = participants?.map((p: any) => p.employee_id) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{eventTitle}</DialogTitle>
          <DialogDescription>Gestión de participantes y firmas</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress bar */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso de firmas</span>
              <span className="font-semibold">{signedCount} de {totalParticipants}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-right text-xs text-muted-foreground">{progress}% completado</p>
          </div>

          {/* Add participant */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Participantes ({totalParticipants})</h3>
            <Button size="sm" onClick={() => setShowAddParticipant(!showAddParticipant)}>
              <Plus className="mr-1 h-4 w-4" />
              Agregar
            </Button>
          </div>

          {showAddParticipant && (
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Empleado *</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees
                        ?.filter((e) => !existingEmployeeIds.includes(e.id))
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!selectedEmployee || addParticipantMutation.isPending}
                    onClick={() => addParticipantMutation.mutate()}
                  >
                    {addParticipantMutation.isPending ? "Agregando..." : "Agregar"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Participants table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !participants || participants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sin participantes registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Firmado</TableHead>
                  <TableHead className="w-20">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.employee
                        ? `${p.employee.first_name} ${p.employee.last_name}`
                        : "No encontrado"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.employee?.position || "-"}
                    </TableCell>
                    <TableCell>
                      {p.signed ? (
                        <Badge className="bg-success/10 text-success border-success/20">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Firmado
                        </Badge>
                      ) : (
                        <Badge className="bg-warning/10 text-warning border-warning/20">
                          <Clock className="mr-1 h-3 w-3" />
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.signed_at
                        ? format(new Date(p.signed_at), "d MMM yyyy HH:mm", { locale: es })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={p.signed ? "outline" : "default"}
                        size="sm"
                        className="text-xs"
                        onClick={() =>
                          toggleSignatureMutation.mutate({
                            participantId: p.id,
                            signed: !p.signed,
                          })
                        }
                      >
                        {p.signed ? "Desmarcar" : "Firmar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
