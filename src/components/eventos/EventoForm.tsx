import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface EventoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    title: string;
    event_type: string;
    event_date: string;
    description: string | null;
    location: string | null;
    status: string;
  } | null;
}

export function EventoForm({ open, onOpenChange, editData }: EventoFormProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!editData;

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("borrador");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    if (open && editData) {
      setTitle(editData.title);
      setEventType(editData.event_type);
      setEventDate(editData.event_date);
      setDescription(editData.description || "");
      setLocation(editData.location || "");
      setStatus(editData.status);
      setSelectedEmployees([]);
    } else if (open && !editData) {
      setTitle("");
      setEventType("");
      setEventDate("");
      setDescription("");
      setLocation("");
      setStatus("borrador");
      setSelectedEmployees([]);
    }
  }, [open, editData]);

  const { data: eventTypes } = useQuery({
    queryKey: ["event_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_types" as any)
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return (data as any) as { id: string; name: string }[];
    },
    enabled: open,
  });

  const { data: employees } = useQuery({
    queryKey: ["employees-for-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("active", true)
        .order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: open && !isEditing,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!profile?.tenant_id) throw new Error("Sin tenant");

      if (isEditing) {
        const { error } = await supabase
          .from("events" as any)
          .update({
            title,
            event_type: eventType,
            event_date: eventDate,
            description: description || null,
            location: location || null,
            status,
          })
          .eq("id", editData.id);
        if (error) throw error;
      } else {
        const { data: newEvent, error } = await supabase
          .from("events" as any)
          .insert({
            tenant_id: profile.tenant_id,
            title,
            event_type: eventType,
            event_date: eventDate,
            description: description || null,
            location: location || null,
            status,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select("id")
          .single();
        if (error) throw error;

        // Add participants
        if (selectedEmployees.length > 0 && newEvent) {
          const participants = selectedEmployees.map((empId) => ({
            event_id: (newEvent as any).id,
            employee_id: empId,
          }));
          const { error: pError } = await supabase
            .from("event_participants" as any)
            .insert(participants);
          if (pError) throw pError;
        }
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "Evento actualizado" : "Evento creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error: " + error.message);
    },
  });

  const toggleEmployee = (empId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los datos del evento" : "Registra un nuevo evento"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Inducción General SST"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={eventType} onValueChange={setEventType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes?.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_date">Fecha *</Label>
              <Input
                id="event_date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Sala de reuniones principal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del evento"
              rows={2}
            />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="en_progreso">En progreso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isEditing && (
            <div className="space-y-2">
              <Label>Participantes</Label>
              {selectedEmployees.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedEmployees.map((empId) => {
                    const emp = employees?.find((e) => e.id === empId);
                    return (
                      <Badge key={empId} variant="secondary" className="gap-1">
                        {emp ? `${emp.first_name} ${emp.last_name}` : empId}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => toggleEmployee(empId)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
              <Select onValueChange={toggleEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Agregar participantes..." />
                </SelectTrigger>
                <SelectContent>
                  {employees
                    ?.filter((e) => !selectedEmployees.includes(e.id))
                    .map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="gradient-primary">
              {mutation.isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
