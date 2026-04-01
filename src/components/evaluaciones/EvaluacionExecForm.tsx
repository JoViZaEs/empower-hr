import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Star, CheckCircle2, Save } from "lucide-react";

interface EvaluacionExecFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluationId: string | null;
}

interface ResponseData {
  [criterionId: string]: {
    score: number | null;
    response_value: string;
    comments: string;
  };
}

export function EvaluacionExecForm({ open, onOpenChange, evaluationId }: EvaluacionExecFormProps) {
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState<ResponseData>({});
  const [strengths, setStrengths] = useState("");
  const [areasImprovement, setAreasImprovement] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [comments, setComments] = useState("");

  // Fetch evaluation with template structure
  const { data: evaluation, isLoading } = useQuery({
    queryKey: ["evaluation-detail", evaluationId],
    queryFn: async () => {
      if (!evaluationId) return null;

      const { data: eval_, error: evalErr } = await supabase
        .from("evaluations")
        .select("*, evaluation_templates(*, evaluation_template_sections(*, evaluation_template_criteria(*))), employees(first_name, last_name, position)")
        .eq("id", evaluationId)
        .single();
      if (evalErr) throw evalErr;

      // Load existing responses
      const { data: existingResponses } = await supabase
        .from("evaluation_responses")
        .select("*")
        .eq("evaluation_id", evaluationId);

      return { ...eval_, existing_responses: existingResponses || [] };
    },
    enabled: open && !!evaluationId,
  });

  // Initialize responses from existing data
  const initResponses = () => {
    if (!evaluation) return;
    const init: ResponseData = {};
    const existing = evaluation.existing_responses as any[];

    evaluation.evaluation_templates?.evaluation_template_sections
      ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
      .forEach((section: any) => {
        section.evaluation_template_criteria
          ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
          .forEach((criterion: any) => {
            const resp = existing.find((r: any) => r.criterion_id === criterion.id);
            init[criterion.id] = {
              score: resp?.score ?? null,
              response_value: resp?.response_value ?? "",
              comments: resp?.comments ?? "",
            };
          });
      });

    setResponses(init);
    setStrengths(evaluation.strengths || "");
    setAreasImprovement(evaluation.areas_improvement || "");
    setActionPlan(evaluation.action_plan || "");
    setComments(evaluation.comments || "");
  };

  // Initialize on load
  const [initialized, setInitialized] = useState<string | null>(null);
  if (evaluation && evaluationId && initialized !== evaluationId) {
    initResponses();
    setInitialized(evaluationId);
  }

  const updateResponse = (criterionId: string, field: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], [field]: value },
    }));
  };

  const template = evaluation?.evaluation_templates;
  const sections = template?.evaluation_template_sections
    ?.slice()
    .sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
  const isCompleted = evaluation?.status === "completada";
  const scaleMin = template?.scale_min ?? 1;
  const scaleMax = template?.scale_max ?? 5;

  // Calculate progress
  const totalCriteria = sections.reduce((acc: number, s: any) =>
    acc + (s.evaluation_template_criteria?.length || 0), 0);
  const answeredCriteria = Object.values(responses).filter(r =>
    r.score !== null || r.response_value !== "").length;
  const progress = totalCriteria > 0 ? (answeredCriteria / totalCriteria) * 100 : 0;

  const saveMutation = useMutation({
    mutationFn: async (finalize: boolean) => {
      if (!evaluationId) throw new Error("No evaluation ID");

      // Upsert responses
      const responseRows = Object.entries(responses)
        .filter(([_, r]) => r.score !== null || r.response_value !== "")
        .map(([criterionId, r]) => ({
          evaluation_id: evaluationId,
          criterion_id: criterionId,
          score: r.score,
          response_value: r.response_value || null,
          comments: r.comments || null,
        }));

      // Delete existing and re-insert
      await supabase
        .from("evaluation_responses")
        .delete()
        .eq("evaluation_id", evaluationId);

      if (responseRows.length > 0) {
        const { error: respErr } = await supabase
          .from("evaluation_responses")
          .insert(responseRows);
        if (respErr) throw respErr;
      }

      // Calculate score using DB function
      let overallScore = null;
      if (finalize) {
        const { data: scoreData } = await supabase.rpc("calculate_evaluation_score", {
          _evaluation_id: evaluationId,
        });
        overallScore = scoreData;
      }

      // Update evaluation
      const { error: updateErr } = await supabase
        .from("evaluations")
        .update({
          status: finalize ? "completada" : "en_proceso",
          overall_score: overallScore,
          strengths: strengths || null,
          areas_improvement: areasImprovement || null,
          action_plan: actionPlan || null,
          comments: comments || null,
        })
        .eq("id", evaluationId);

      if (updateErr) throw updateErr;
    },
    onSuccess: (_, finalize) => {
      toast.success(finalize ? "Evaluación completada exitosamente" : "Progreso guardado");
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["evaluation-detail", evaluationId] });
      if (finalize) {
        setInitialized(null);
        onOpenChange(false);
      }
    },
    onError: (err: any) => {
      toast.error("Error: " + err.message);
    },
  });

  const renderCriterionInput = (criterion: any) => {
    const resp = responses[criterion.id] || { score: null, response_value: "", comments: "" };
    const options: string[] = Array.isArray(criterion.options) ? criterion.options : [];

    switch (criterion.response_type) {
      case "scale":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Slider
                min={scaleMin}
                max={scaleMax}
                step={1}
                value={[resp.score ?? scaleMin]}
                onValueChange={([v]) => updateResponse(criterion.id, "score", v)}
                disabled={isCompleted}
                className="flex-1"
              />
              <Badge variant="outline" className="min-w-[3rem] justify-center text-base font-bold">
                {resp.score ?? "-"}
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{scaleMin}</span>
              <span>{scaleMax}</span>
            </div>
          </div>
        );

      case "single_choice":
        return (
          <RadioGroup
            value={resp.response_value}
            onValueChange={(v) => updateResponse(criterion.id, "response_value", v)}
            disabled={isCompleted}
          >
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`${criterion.id}-${i}`} />
                <Label htmlFor={`${criterion.id}-${i}`} className="font-normal cursor-pointer">
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "multiple_choice":
        const selected = resp.response_value ? resp.response_value.split("||") : [];
        return (
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Checkbox
                  id={`${criterion.id}-${i}`}
                  checked={selected.includes(opt)}
                  disabled={isCompleted}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...selected, opt]
                      : selected.filter((s: string) => s !== opt);
                    updateResponse(criterion.id, "response_value", next.join("||"));
                  }}
                />
                <Label htmlFor={`${criterion.id}-${i}`} className="font-normal cursor-pointer">
                  {opt}
                </Label>
              </div>
            ))}
          </div>
        );

      case "yes_no":
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={resp.response_value === "Sí"}
              disabled={isCompleted}
              onCheckedChange={(v) => updateResponse(criterion.id, "response_value", v ? "Sí" : "No")}
            />
            <span className="text-sm font-medium">
              {resp.response_value || "Sin responder"}
            </span>
          </div>
        );

      case "open_text":
        return (
          <Textarea
            placeholder="Escriba su respuesta..."
            value={resp.response_value}
            onChange={(e) => updateResponse(criterion.id, "response_value", e.target.value)}
            disabled={isCompleted}
            rows={3}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setInitialized(null); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCompleted && <CheckCircle2 className="h-5 w-5 text-success" />}
            {isCompleted ? "Detalle de Evaluación" : "Ejecutar Evaluación"}
          </DialogTitle>
          <DialogDescription>
            {evaluation?.employees?.first_name} {evaluation?.employees?.last_name}
            {evaluation?.employees?.position ? ` — ${evaluation.employees.position}` : ""}
            {template ? ` | ${template.name}` : ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {/* Progress */}
            {!isCompleted && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium">{answeredCriteria}/{totalCriteria} respondidas</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Score display for completed */}
            {isCompleted && evaluation?.overall_score != null && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center gap-3">
                    <Star className="h-8 w-8 fill-warning text-warning" />
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{evaluation.overall_score}</p>
                      <p className="text-sm text-muted-foreground">/ {scaleMax}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sections */}
            {sections.map((section: any) => (
              <Card key={section.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{section.name}</CardTitle>
                    <Badge variant="outline">{section.weight}%</Badge>
                  </div>
                  {section.description && (
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {section.evaluation_template_criteria
                    ?.slice()
                    .sort((a: any, b: any) => a.sort_order - b.sort_order)
                    .map((criterion: any) => (
                      <div key={criterion.id} className="space-y-2">
                        <div>
                          <p className="font-medium text-sm">{criterion.name}</p>
                          {criterion.description && (
                            <p className="text-xs text-muted-foreground">{criterion.description}</p>
                          )}
                        </div>
                        {renderCriterionInput(criterion)}
                        {/* Optional comments per criterion */}
                        {!isCompleted && criterion.response_type !== "open_text" && (
                          <Input
                            placeholder="Comentario (opcional)"
                            value={responses[criterion.id]?.comments || ""}
                            onChange={(e) => updateResponse(criterion.id, "comments", e.target.value)}
                            className="text-xs h-8"
                          />
                        )}
                        {isCompleted && responses[criterion.id]?.comments && (
                          <p className="text-xs text-muted-foreground italic">
                            💬 {responses[criterion.id].comments}
                          </p>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}

            <Separator />

            {/* Summary fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Fortalezas</Label>
                <Textarea
                  placeholder="Fortalezas identificadas..."
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  disabled={isCompleted}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Áreas de Mejora</Label>
                <Textarea
                  placeholder="Áreas de mejora identificadas..."
                  value={areasImprovement}
                  onChange={(e) => setAreasImprovement(e.target.value)}
                  disabled={isCompleted}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Plan de Acción</Label>
                <Textarea
                  placeholder="Plan de acción y compromisos..."
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  disabled={isCompleted}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Comentarios Generales</Label>
                <Textarea
                  placeholder="Observaciones adicionales..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  disabled={isCompleted}
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {!isCompleted && !isLoading && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setInitialized(null); onOpenChange(false); }}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              onClick={() => saveMutation.mutate(false)}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Borrador
            </Button>
            <Button
              onClick={() => saveMutation.mutate(true)}
              disabled={saveMutation.isPending || progress < 100}
              className="gap-2"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Completar Evaluación
            </Button>
          </DialogFooter>
        )}

        {isCompleted && (
          <DialogFooter>
            <Button variant="outline" onClick={() => { setInitialized(null); onOpenChange(false); }}>
              Cerrar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
