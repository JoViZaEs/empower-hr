import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Stethoscope, Loader2, FileX } from "lucide-react";

interface EmpleadoExamenesProps {
  employeeId: string;
}

const statusBadge: Record<string, React.ReactNode> = {
  vigente: <Badge className="bg-success/10 text-success border-success/20">Vigente</Badge>,
  pendiente: <Badge className="bg-warning/10 text-warning border-warning/20">Pendiente</Badge>,
  vencido: <Badge className="bg-destructive/10 text-destructive border-destructive/20">Vencido</Badge>,
  proximo_vencer: <Badge className="bg-warning/10 text-warning border-warning/20">Por vencer</Badge>,
};

export function EmpleadoExamenes({ employeeId }: EmpleadoExamenesProps) {
  const { data: exams, isLoading } = useQuery({
    queryKey: ["employee-exams", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("employee_id", employeeId)
        .order("exam_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "d MMM yyyy", { locale: es });
  };

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
          <Stethoscope className="h-5 w-5 text-primary" />
          Historial de Exámenes Médicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!exams || exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileX className="h-12 w-12 mb-2" />
            <p>No hay exámenes registrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Examen</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.exam_type}</TableCell>
                  <TableCell>{formatDate(exam.exam_date)}</TableCell>
                  <TableCell>{formatDate(exam.expiry_date)}</TableCell>
                  <TableCell>{exam.result || "-"}</TableCell>
                  <TableCell>
                    {statusBadge[exam.status || "pendiente"]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
