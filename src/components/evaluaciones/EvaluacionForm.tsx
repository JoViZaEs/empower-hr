import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EvaluacionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EvaluacionForm({ open, onOpenChange }: EvaluacionFormProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = profile?.tenant_id;

  const [templateId, setTemplateId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [evaluatorId, setEvaluatorId] = useState("");
  const [evaluationDate, setEvaluationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [period, setPeriod] = useState("");
  const [comments, setComments] = useState("");

  const { data: templates } = useQuery({
    queryKey: ["evaluation-templates-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_templates")
        .select("id, name, evaluation_type, periodicity")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, position")
        .eq("active", true)
        .order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("No tenant");
      const { error } = await supabase.from("evaluations").insert({
        tenant_id: tenantId,
        template_id: templateId,
        employee_id: employeeId,
        evaluator_id: evaluatorId || null,
        evaluation_date: evaluationDate,
        period,
        comments: comments || null,
        status: "pendiente" as const,
        created_by: profile?.user_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Evaluación creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error("Error al crear la evaluación: " + err.message);
    },
  });

  const resetForm = () => {
    setTemplateId("");
    setEmployeeId("");
    setEvaluatorId("");
    setEvaluationDate(new Date().toISOString().split("T")[0]);
    setPeriod("");
    setComments("");
  };

  const canSubmit = templateId && employeeId && evaluationDate && period;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Nueva Evaluación</DialogTitle>
          <DialogDescription>
            Selecciona la plantilla y el empleado a evaluar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Plantilla de Evaluación *</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plantilla..." />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.evaluation_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Empleado a Evaluar *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empleado..." />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.first_name} {e.last_name}
                    {e.position ? ` — ${e.position}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Evaluador</Label>
            <Select value={evaluatorId} onValueChange={setEvaluatorId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar evaluador (opcional)..." />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.first_name} {e.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Evaluación *</Label>
              <Input
                type="date"
                value={evaluationDate}
                onChange={(e) => setEvaluationDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Período *</Label>
              <Input
                placeholder="Ej: 2026-Q1"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Comentarios</Label>
            <Textarea
              placeholder="Observaciones adicionales..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Crear Evaluación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
