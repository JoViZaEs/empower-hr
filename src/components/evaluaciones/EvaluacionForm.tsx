import { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Users, User, Building2, RotateCcw, Search } from "lucide-react";

interface EvaluacionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const modeLabels: Record<string, { label: string; icon: any; description: string }> = {
  individual: { label: "Individual", icon: User, description: "Selecciona un empleado" },
  bulk: { label: "Selección múltiple", icon: Users, description: "Selecciona varios empleados" },
  department: { label: "Por departamento", icon: Building2, description: "Todos los de un departamento" },
  self: { label: "Auto-evaluación", icon: RotateCcw, description: "Cada empleado se evalúa a sí mismo" },
  "360": { label: "360°", icon: Users, description: "Selecciona empleado y evaluadores" },
};

export function EvaluacionForm({ open, onOpenChange }: EvaluacionFormProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = profile?.tenant_id;

  const [templateId, setTemplateId] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [evaluatorId, setEvaluatorId] = useState("");
  const [selectedEvaluators360, setSelectedEvaluators360] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [evaluationDate, setEvaluationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [period, setPeriod] = useState("");
  const [comments, setComments] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [targetEmployeeId, setTargetEmployeeId] = useState("");

  const { data: templates } = useQuery({
    queryKey: ["evaluation-templates-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_templates")
        .select("id, name, evaluation_type, periodicity, assignment_mode")
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
        .select("id, first_name, last_name, position, department")
        .eq("active", true)
        .order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const selectedTemplate = templates?.find((t) => t.id === templateId);
  const assignmentMode = (selectedTemplate as any)?.assignment_mode || "individual";

  const departments = useMemo(() => {
    if (!employees) return [];
    const depts = [...new Set(employees.map((e) => e.department).filter(Boolean))];
    return depts.sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    let filtered = employees;
    if (assignmentMode === "department" && departmentFilter) {
      filtered = filtered.filter((e) => e.department === departmentFilter);
    }
    if (employeeSearch) {
      const search = employeeSearch.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          `${e.first_name} ${e.last_name}`.toLowerCase().includes(search) ||
          e.position?.toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [employees, assignmentMode, departmentFilter, employeeSearch]);

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleEvaluator360 = (id: string) => {
    setSelectedEvaluators360((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredEmployees.map((e) => e.id);
    setSelectedEmployees(ids);
  };

  const deselectAll = () => setSelectedEmployees([]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("No tenant");

      let employeeIds: string[] = [];
      let evaluatorIds: (string | null)[] = [];

      if (assignmentMode === "individual") {
        employeeIds = selectedEmployees.slice(0, 1);
        evaluatorIds = [evaluatorId || null];
      } else if (assignmentMode === "bulk" || assignmentMode === "department") {
        employeeIds = selectedEmployees;
        evaluatorIds = employeeIds.map(() => evaluatorId || null);
      } else if (assignmentMode === "self") {
        employeeIds = selectedEmployees;
        evaluatorIds = selectedEmployees.map((id) => id); // self-evaluation
      } else if (assignmentMode === "360") {
        // For 360: create one evaluation per evaluator for the target employee
        if (!targetEmployeeId || selectedEvaluators360.length === 0) {
          throw new Error("Selecciona empleado y al menos un evaluador");
        }
        employeeIds = selectedEvaluators360.map(() => targetEmployeeId);
        evaluatorIds = selectedEvaluators360;
      }

      if (employeeIds.length === 0) throw new Error("No hay empleados seleccionados");

      const inserts = employeeIds.map((empId, i) => ({
        tenant_id: tenantId,
        template_id: templateId,
        employee_id: empId,
        evaluator_id: evaluatorIds[i] || null,
        evaluation_date: evaluationDate,
        period,
        comments: comments || null,
        status: "pendiente" as const,
        created_by: profile?.user_id,
      }));

      const { error } = await supabase.from("evaluations").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      const count =
        assignmentMode === "360"
          ? selectedEvaluators360.length
          : selectedEmployees.length;
      toast.success(
        count > 1
          ? `${count} evaluaciones creadas exitosamente`
          : "Evaluación creada exitosamente"
      );
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
    setSelectedEmployees([]);
    setEvaluatorId("");
    setSelectedEvaluators360([]);
    setDepartmentFilter("");
    setTargetEmployeeId("");
    setEvaluationDate(new Date().toISOString().split("T")[0]);
    setPeriod("");
    setComments("");
    setEmployeeSearch("");
  };

  const canSubmit = (() => {
    if (!templateId || !evaluationDate || !period) return false;
    if (assignmentMode === "360") {
      return !!targetEmployeeId && selectedEvaluators360.length > 0;
    }
    return selectedEmployees.length > 0;
  })();

  const ModeInfo = modeLabels[assignmentMode];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Evaluación</DialogTitle>
          <DialogDescription>
            Selecciona la plantilla y asigna empleados según el modo configurado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template */}
          <div className="space-y-2">
            <Label>Plantilla de Evaluación *</Label>
            <Select
              value={templateId}
              onValueChange={(v) => {
                setTemplateId(v);
                setSelectedEmployees([]);
                setSelectedEvaluators360([]);
                setTargetEmployeeId("");
                setDepartmentFilter("");
              }}
            >
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

          {/* Assignment mode badge */}
          {selectedTemplate && ModeInfo && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <ModeInfo.icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">{ModeInfo.label}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  — {ModeInfo.description}
                </span>
              </div>
            </div>
          )}

          {/* Department filter (for department mode) */}
          {assignmentMode === "department" && (
            <div className="space-y-2">
              <Label>Departamento *</Label>
              <Select
                value={departmentFilter}
                onValueChange={(v) => {
                  setDepartmentFilter(v);
                  const deptEmployees =
                    employees?.filter((e) => e.department === v).map((e) => e.id) || [];
                  setSelectedEmployees(deptEmployees);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar departamento..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d!} value={d!}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 360° target employee */}
          {assignmentMode === "360" && (
            <div className="space-y-2">
              <Label>Empleado a Evaluar *</Label>
              <Select value={targetEmployeeId} onValueChange={setTargetEmployeeId}>
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
          )}

          {/* Employee selection for individual mode */}
          {assignmentMode === "individual" && (
            <div className="space-y-2">
              <Label>Empleado a Evaluar *</Label>
              <Select
                value={selectedEmployees[0] || ""}
                onValueChange={(v) => setSelectedEmployees([v])}
              >
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
          )}

          {/* Multi-select employees for bulk, department, self */}
          {(assignmentMode === "bulk" || assignmentMode === "self" || assignmentMode === "department") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {assignmentMode === "self"
                    ? "Empleados que se auto-evaluarán *"
                    : "Empleados a Evaluar *"}
                </Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={selectAllFiltered}
                  >
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={deselectAll}
                  >
                    Ninguno
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar empleado..."
                  className="pl-10"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                />
              </div>
              <div className="border rounded-md max-h-[200px] overflow-y-auto divide-y">
                {filteredEmployees.map((e) => (
                  <label
                    key={e.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedEmployees.includes(e.id)}
                      onCheckedChange={() => toggleEmployee(e.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {e.first_name} {e.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[e.position, e.department].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                  </label>
                ))}
                {filteredEmployees.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No se encontraron empleados
                  </p>
                )}
              </div>
              {selectedEmployees.length > 0 && (
                <Badge variant="secondary">
                  {selectedEmployees.length} empleado{selectedEmployees.length > 1 ? "s" : ""} seleccionado{selectedEmployees.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          )}

          {/* 360° evaluators multi-select */}
          {assignmentMode === "360" && targetEmployeeId && (
            <div className="space-y-2">
              <Label>Evaluadores *</Label>
              <p className="text-xs text-muted-foreground">
                Selecciona las personas que evaluarán al empleado
              </p>
              <div className="border rounded-md max-h-[180px] overflow-y-auto divide-y">
                {employees
                  ?.filter((e) => e.id !== targetEmployeeId)
                  .map((e) => (
                    <label
                      key={e.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedEvaluators360.includes(e.id)}
                        onCheckedChange={() => toggleEvaluator360(e.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {e.first_name} {e.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {e.position || "—"}
                        </p>
                      </div>
                    </label>
                  ))}
              </div>
              {selectedEvaluators360.length > 0 && (
                <Badge variant="secondary">
                  {selectedEvaluators360.length} evaluador{selectedEvaluators360.length > 1 ? "es" : ""}
                </Badge>
              )}
            </div>
          )}

          {/* Evaluator (for individual/bulk/department) */}
          {assignmentMode !== "self" && assignmentMode !== "360" && (
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
          )}

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
              rows={2}
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
            {assignmentMode === "360"
              ? `Crear ${selectedEvaluators360.length || 0} Evaluación(es)`
              : selectedEmployees.length > 1
                ? `Crear ${selectedEmployees.length} Evaluaciones`
                : "Crear Evaluación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
