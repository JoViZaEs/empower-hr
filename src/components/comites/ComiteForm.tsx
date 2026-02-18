import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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

interface ComiteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    name: string;
    description: string | null;
    start_date: string;
    end_date: string | null;
  } | null;
}

export function ComiteForm({ open, onOpenChange, editData }: ComiteFormProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!editData;

  const [name, setName] = useState(editData?.name || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [startDate, setStartDate] = useState(editData?.start_date || "");
  const [endDate, setEndDate] = useState(editData?.end_date || "");

  const resetForm = () => {
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!profile?.tenant_id) throw new Error("Sin tenant");

      if (isEditing) {
        const { error } = await supabase
          .from("committees")
          .update({
            name,
            description: description || null,
            start_date: startDate,
            end_date: endDate || null,
          })
          .eq("id", editData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("committees").insert({
          tenant_id: profile.tenant_id,
          name,
          description: description || null,
          start_date: startDate,
          end_date: endDate || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "Comité actualizado" : "Comité creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["committees"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error: " + error.message);
    },
  });

  // Reset form when dialog opens with edit data or fresh
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && editData) {
      setName(editData.name);
      setDescription(editData.description || "");
      setStartDate(editData.start_date);
      setEndDate(editData.end_date || "");
    } else if (isOpen && !editData) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Comité" : "Nuevo Comité"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifica los datos del comité" : "Registra un nuevo comité o brigada"}
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
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: COPASST"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del comité"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha Inicio *</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="gradient-primary">
              {mutation.isPending ? "Guardando..." : isEditing ? "Actualizar" : "Crear Comité"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
