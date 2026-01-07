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
import { GraduationCap, Loader2, FileX } from "lucide-react";

interface EmpleadoCursosProps {
  employeeId: string;
}

const statusBadge: Record<string, React.ReactNode> = {
  completado: <Badge className="bg-success/10 text-success border-success/20">Completado</Badge>,
  pendiente: <Badge className="bg-warning/10 text-warning border-warning/20">Pendiente</Badge>,
  en_progreso: <Badge className="bg-primary/10 text-primary border-primary/20">En progreso</Badge>,
  vencido: <Badge className="bg-destructive/10 text-destructive border-destructive/20">Vencido</Badge>,
};

export function EmpleadoCursos({ employeeId }: EmpleadoCursosProps) {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["employee-courses", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("employee_id", employeeId)
        .order("start_date", { ascending: false });

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
          <GraduationCap className="h-5 w-5 text-primary" />
          Cursos y Capacitaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!courses || courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileX className="h-12 w-12 mb-2" />
            <p>No hay cursos registrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.course_name}</TableCell>
                  <TableCell>{course.provider || "-"}</TableCell>
                  <TableCell>{formatDate(course.start_date)}</TableCell>
                  <TableCell>{course.duration_hours ? `${course.duration_hours}h` : "-"}</TableCell>
                  <TableCell>{course.grade ? `${course.grade}%` : "-"}</TableCell>
                  <TableCell>
                    {statusBadge[course.status || "pendiente"]}
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
