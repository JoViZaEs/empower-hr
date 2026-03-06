import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export interface Criterion {
  name: string;
  description: string;
  sort_order: number;
  response_type: string;
  options: string[];
  correct_answer: string;
}

const RESPONSE_TYPES = [
  { value: "scale", label: "Escala numérica" },
  { value: "single_choice", label: "Selección única" },
  { value: "multiple_choice", label: "Selección múltiple" },
  { value: "yes_no", label: "Sí / No" },
  { value: "open_text", label: "Texto abierto" },
];

interface CriterionRowProps {
  criterion: Criterion;
  sectionIdx: number;
  criterionIdx: number;
  onUpdate: (sIdx: number, cIdx: number, field: keyof Criterion, value: any) => void;
  onRemove: (sIdx: number, cIdx: number) => void;
}

export function CriterionRow({ criterion, sectionIdx, criterionIdx, onUpdate, onRemove }: CriterionRowProps) {
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (!newOption.trim()) return;
    const updated = [...criterion.options, newOption.trim()];
    onUpdate(sectionIdx, criterionIdx, "options", updated);
    setNewOption("");
  };

  const removeOption = (idx: number) => {
    const updated = criterion.options.filter((_, i) => i !== idx);
    onUpdate(sectionIdx, criterionIdx, "options", updated);
    // Clear correct_answer if removed option was the answer
    if (criterion.correct_answer === criterion.options[idx]) {
      onUpdate(sectionIdx, criterionIdx, "correct_answer", "");
    }
  };

  const needsOptions = criterion.response_type === "single_choice" || criterion.response_type === "multiple_choice";
  const canSetCorrectAnswer = criterion.response_type === "yes_no" || needsOptions;

  const correctAnswerOptions = criterion.response_type === "yes_no"
    ? ["Sí", "No"]
    : criterion.options;

  return (
    <div className="pl-6 space-y-2 border-l-2 border-muted ml-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Criterio / Pregunta *"
          value={criterion.name}
          onChange={(e) => onUpdate(sectionIdx, criterionIdx, "name", e.target.value)}
          className="flex-1"
        />
        <Select
          value={criterion.response_type}
          onValueChange={(v) => {
            onUpdate(sectionIdx, criterionIdx, "response_type", v);
            if (v === "yes_no" || v === "scale" || v === "open_text") {
              onUpdate(sectionIdx, criterionIdx, "options", []);
            }
            onUpdate(sectionIdx, criterionIdx, "correct_answer", "");
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESPONSE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive shrink-0"
          onClick={() => onRemove(sectionIdx, criterionIdx)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <Input
        placeholder="Descripción (opcional)"
        value={criterion.description}
        onChange={(e) => onUpdate(sectionIdx, criterionIdx, "description", e.target.value)}
        className="text-sm"
      />

      {/* Options editor for choice types */}
      {needsOptions && (
        <div className="space-y-1.5 pl-2">
          <p className="text-xs font-medium text-muted-foreground">Opciones de respuesta:</p>
          <div className="flex flex-wrap gap-1.5">
            {criterion.options.map((opt, i) => (
              <Badge key={i} variant="secondary" className="gap-1 pr-1">
                {opt}
                <button type="button" onClick={() => removeOption(i)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              placeholder="Nueva opción..."
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
              className="h-8 text-sm flex-1 max-w-xs"
            />
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={addOption}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Correct answer selector */}
      {canSetCorrectAnswer && correctAnswerOptions.length > 0 && (
        <div className="pl-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">Respuesta correcta:</p>
            <Select
              value={criterion.correct_answer || "__none__"}
              onValueChange={(v) => onUpdate(sectionIdx, criterionIdx, "correct_answer", v === "__none__" ? "" : v)}
            >
              <SelectTrigger className="h-8 text-sm max-w-xs">
                <SelectValue placeholder="Sin calificación automática" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin calificación automática</SelectItem>
                {correctAnswerOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
