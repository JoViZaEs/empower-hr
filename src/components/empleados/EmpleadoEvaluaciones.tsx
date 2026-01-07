import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ClipboardCheck, Target, Loader2, FileX } from "lucide-react";

interface EmpleadoEvaluacionesProps {
  employeeId: string;
}

const statusBadge: Record<string, React.ReactNode> = {
  completada: <Badge className="bg-success/10 text-success border-success/20">Completada</Badge>,
  pendiente: <Badge className="bg-warning/10 text-warning border-warning/20">Pendiente</Badge>,
  en_proceso: <Badge className="bg-primary/10 text-primary border-primary/20">En proceso</Badge>,
  cancelada: <Badge className="bg-muted text-muted-foreground">Cancelada</Badge>,
};

export function EmpleadoEvaluaciones({ employeeId }: EmpleadoEvaluacionesProps) {
  const { data: performanceEvals, isLoading: loadingPerformance } = useQuery({
    queryKey: ["employee-performance-evaluations", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_evaluations")
        .select("*")
        .eq("employee_id", employeeId)
        .order("evaluation_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: competencyEvals, isLoading: loadingCompetency } = useQuery({
    queryKey: ["employee-competency-evaluations", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competency_evaluations")
        .select("*")
        .eq("employee_id", employeeId)
        .order("evaluation_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "d MMM yyyy", { locale: es });
  };

  const isLoading = loadingPerformance || loadingCompetency;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Evaluaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="desempeno" className="space-y-4">
          <TabsList>
            <TabsTrigger value="desempeno">Evaluaciones de Desempeño</TabsTrigger>
            <TabsTrigger value="competencias">Evaluaciones de Competencias</TabsTrigger>
          </TabsList>

          <TabsContent value="desempeno">
            {!performanceEvals || performanceEvals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileX className="h-12 w-12 mb-2" />
                <p>No hay evaluaciones de desempeño registradas</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Puntaje</TableHead>
                    <TableHead>Fortalezas</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceEvals.map((eval_) => (
                    <TableRow key={eval_.id}>
                      <TableCell className="font-medium">{eval_.period}</TableCell>
                      <TableCell>{formatDate(eval_.evaluation_date)}</TableCell>
                      <TableCell>
                        {eval_.overall_score ? (
                          <span className="font-semibold">{eval_.overall_score}%</span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {eval_.strengths || "-"}
                      </TableCell>
                      <TableCell>
                        {statusBadge[eval_.status || "pendiente"]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="competencias">
            {!competencyEvals || competencyEvals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileX className="h-12 w-12 mb-2" />
                <p>No hay evaluaciones de competencias registradas</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competencia</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Nivel Esperado</TableHead>
                    <TableHead>Nivel Actual</TableHead>
                    <TableHead>Brecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competencyEvals.map((eval_) => (
                    <TableRow key={eval_.id}>
                      <TableCell className="font-medium">{eval_.competency_name}</TableCell>
                      <TableCell>{formatDate(eval_.evaluation_date)}</TableCell>
                      <TableCell>{eval_.expected_level}</TableCell>
                      <TableCell>{eval_.actual_level}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={eval_.gap && eval_.gap < 0 
                            ? "border-destructive text-destructive" 
                            : "border-success text-success"
                          }
                        >
                          {eval_.gap || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {statusBadge[eval_.status || "pendiente"]}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
