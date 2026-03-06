import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { CriterionRow, type Criterion } from "./CriterionRow";

interface Section {
  name: string;
  description: string;
  weight: number;
  sort_order: number;
  criteria: Criterion[];
}

interface PlantillaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlantillaForm({ open, onOpenChange }: PlantillaFormProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = profile?.tenant_id;

  const [name, setName] = useState("");
  const [evaluationType, setEvaluationType] = useState("");
  const [description, setDescription] = useState("");
  const [periodicity, setPeriodicity] = useState("anual");
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);

  const { data: evalTypes } = useQuery({
    queryKey: ["evaluation-types-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_types")
        .select("id, name")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const addSection = () => {
    setSections([
      ...sections,
      { name: "", description: "", weight: 100, sort_order: sections.length, criteria: [] },
    ]);
  };

  const removeSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const updateSection = (idx: number, field: keyof Section, value: any) => {
    const updated = [...sections];
    (updated[idx] as any)[field] = value;
    setSections(updated);
  };

  const addCriterion = (sectionIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx].criteria.push({
      name: "",
      description: "",
      sort_order: updated[sectionIdx].criteria.length,
      response_type: "scale",
      options: [],
      correct_answer: "",
    });
    setSections(updated);
  };

  const removeCriterion = (sectionIdx: number, criterionIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx].criteria = updated[sectionIdx].criteria.filter((_, i) => i !== criterionIdx);
    setSections(updated);
  };

  const updateCriterion = (sectionIdx: number, criterionIdx: number, field: keyof Criterion, value: any) => {
    const updated = [...sections];
    (updated[sectionIdx].criteria[criterionIdx] as any)[field] = value;
    setSections(updated);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error("No tenant");

      const { data: template, error: tErr } = await supabase
        .from("evaluation_templates")
        .insert({
          tenant_id: tenantId,
          name,
          evaluation_type: evaluationType,
          description: description || null,
          periodicity,
          scale_min: scaleMin,
          scale_max: scaleMax,
          is_anonymous: isAnonymous,
          created_by: profile?.user_id,
        })
        .select("id")
        .single();

      if (tErr) throw tErr;

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const { data: sectionData, error: sErr } = await supabase
          .from("evaluation_template_sections")
          .insert({
            template_id: template.id,
            name: sec.name,
            description: sec.description || null,
            weight: sec.weight,
            sort_order: i,
          })
          .select("id")
          .single();

        if (sErr) throw sErr;

        if (sec.criteria.length > 0) {
          const criteriaInserts = sec.criteria.map((c, j) => ({
            section_id: sectionData.id,
            name: c.name,
            description: c.description || null,
            sort_order: j,
            response_type: c.response_type,
            options: c.options.length > 0 ? c.options : null,
            correct_answer: c.correct_answer || null,
          }));

          const { error: cErr } = await supabase
            .from("evaluation_template_criteria")
            .insert(criteriaInserts);

          if (cErr) throw cErr;
        }
      }
    },
    onSuccess: () => {
      toast.success("Plantilla creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["evaluation-templates"] });
      queryClient.invalidateQueries({ queryKey: ["evaluation-templates-active"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error("Error al crear la plantilla: " + err.message);
    },
  });

  const resetForm = () => {
    setName("");
    setEvaluationType("");
    setDescription("");
    setPeriodicity("anual");
    setScaleMin(1);
    setScaleMax(5);
    setIsAnonymous(false);
    setSections([]);
  };

  const canSubmit =
    name &&
    evaluationType &&
    sections.length > 0 &&
    sections.every((s) => s.name && s.criteria.length > 0 && s.criteria.every((c) => c.name));

  const totalWeight = sections.reduce((acc, s) => acc + Number(s.weight || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Plantilla de Evaluación</DialogTitle>
          <DialogDescription>
            Define el tipo, escala, preguntas y tipos de respuesta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input placeholder="Ej: Evaluación Anual de Desempeño" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Evaluación *</Label>
              <Select value={evaluationType} onValueChange={setEvaluationType}>
                <SelectTrigger><SelectValue placeholder="Seleccionar tipo..." /></SelectTrigger>
                <SelectContent>
                  {evalTypes?.map((t) => (
                    <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea placeholder="Descripción de la plantilla..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Periodicidad</Label>
              <Select value={periodicity} onValueChange={setPeriodicity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="unica">Única vez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Escala mínima</Label>
              <Input type="number" min={0} value={scaleMin} onChange={(e) => setScaleMin(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Escala máxima</Label>
              <Input type="number" min={1} value={scaleMax} onChange={(e) => setScaleMax(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            <Label>Evaluación anónima</Label>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Secciones y Criterios</Label>
              <div className="flex items-center gap-3">
                {sections.length > 0 && (
                  <span className={`text-xs font-medium ${totalWeight === 100 ? "text-success" : "text-destructive"}`}>
                    Peso total: {totalWeight}%
                  </span>
                )}
                <Button type="button" variant="outline" size="sm" onClick={addSection} className="gap-1">
                  <Plus className="h-3 w-3" /> Sección
                </Button>
              </div>
            </div>

            {sections.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Agrega al menos una sección con criterios de evaluación
              </p>
            )}

            {sections.map((section, sIdx) => (
              <Card key={sIdx} className="border-dashed">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Nombre de sección *"
                        value={section.name}
                        onChange={(e) => updateSection(sIdx, "name", e.target.value)}
                        className="col-span-2"
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          type="number" min={0} max={100}
                          value={section.weight}
                          onChange={(e) => updateSection(sIdx, "weight", Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSection(sIdx)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-3">
                  {section.criteria.map((criterion, cIdx) => (
                    <CriterionRow
                      key={cIdx}
                      criterion={criterion}
                      sectionIdx={sIdx}
                      criterionIdx={cIdx}
                      onUpdate={updateCriterion}
                      onRemove={removeCriterion}
                    />
                  ))}
                  <Button type="button" variant="ghost" size="sm" className="ml-6 gap-1 text-xs" onClick={() => addCriterion(sIdx)}>
                    <Plus className="h-3 w-3" /> Agregar criterio
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
