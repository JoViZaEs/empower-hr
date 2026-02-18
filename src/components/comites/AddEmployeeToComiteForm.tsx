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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddEmployeeToComiteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}

export function AddEmployeeToComiteForm({
  open,
  onOpenChange,
  employeeId,
}: AddEmployeeToComiteFormProps) {
  const queryClient = useQueryClient();
  const [selectedCommittee, setSelectedCommittee] = useState("");
  const [role, setRole] = useState("Miembro");
  const [startDate, setStartDate] = useState("");

  const { data: committees } = useQuery({
    queryKey: ["committees-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("committees")
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: committeeRoles } = useQuery({
    queryKey: ["committee-roles-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("committee_roles" as any)
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return (data as any) as { id: string; name: string }[];
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("committee_members").insert({
        committee_id: selectedCommittee,
        employee_id: employeeId,
        role,
        start_date: startDate || null,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Empleado agregado al comité");
      queryClient.invalidateQueries({ queryKey: ["employee-committees", employeeId] });
      setSelectedCommittee("");
      setRole("Miembro");
      setStartDate("");
      onOpenChange(false);
    },
    onError: (err) => toast.error("Error: " + err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar a Comité</DialogTitle>
          <DialogDescription>Asignar empleado a un comité existente</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Comité *</Label>
            <Select value={selectedCommittee} onValueChange={setSelectedCommittee}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar comité" />
              </SelectTrigger>
              <SelectContent>
                {committees?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rol *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {committeeRoles?.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha Inicio</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedCommittee || mutation.isPending}
              className="gradient-primary"
            >
              {mutation.isPending ? "Agregando..." : "Agregar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
