import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, FileX, Plus, ToggleLeft, ToggleRight } from "lucide-react";

interface PlantillasListProps {
  onCreateNew: () => void;
}

export function PlantillasList({ onCreateNew }: PlantillasListProps) {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["evaluation-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_templates")
        .select("*, evaluation_template_sections(id, name, weight, evaluation_template_criteria(id))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("evaluation_templates")
        .update({ active: !active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-templates"] });
      toast.success("Estado actualizado");
    },
  });

  const periodicityLabel: Record<string, string> = {
    trimestral: "Trimestral",
    semestral: "Semestral",
    anual: "Anual",
    unica: "Única vez",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Plantillas de Evaluación</CardTitle>
        <Button size="sm" className="gap-1" onClick={onCreateNew}>
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !templates || templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileX className="h-12 w-12 mb-2" />
            <p>No hay plantillas creadas</p>
            <Button variant="link" onClick={onCreateNew} className="mt-2">
              Crear la primera plantilla
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Periodicidad</TableHead>
                <TableHead>Escala</TableHead>
                <TableHead>Secciones</TableHead>
                <TableHead>Criterios</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t: any) => {
                const totalCriteria = t.evaluation_template_sections?.reduce(
                  (acc: number, s: any) => acc + (s.evaluation_template_criteria?.length || 0),
                  0
                ) || 0;

                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.evaluation_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {periodicityLabel[t.periodicity] || t.periodicity}
                    </TableCell>
                    <TableCell>
                      {t.scale_min} - {t.scale_max}
                    </TableCell>
                    <TableCell>
                      {t.evaluation_template_sections?.length || 0}
                    </TableCell>
                    <TableCell>{totalCriteria}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          t.active
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {t.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleActive.mutate({
                            id: t.id,
                            active: t.active,
                          })
                        }
                      >
                        {t.active ? (
                          <ToggleRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 mr-1" />
                        )}
                        {t.active ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
