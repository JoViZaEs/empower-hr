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
import { ShieldCheck, Loader2, FileX } from "lucide-react";

interface EmpleadoVigilanciasProps {
  employeeId: string;
}

const statusBadge: Record<string, React.ReactNode> = {
  activa: <Badge className="bg-success/10 text-success border-success/20">Activa</Badge>,
  inactiva: <Badge className="bg-muted text-muted-foreground">Inactiva</Badge>,
  vencida: <Badge className="bg-destructive/10 text-destructive border-destructive/20">Vencida</Badge>,
};

export function EmpleadoVigilancias({ employeeId }: EmpleadoVigilanciasProps) {
  const { data: vigilancias, isLoading } = useQuery({
    queryKey: ["employee-vigilancias", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vigilancias")
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
          <ShieldCheck className="h-5 w-5 text-primary" />
          Programas de Vigilancia Epidemiológica
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!vigilancias || vigilancias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileX className="h-12 w-12 mb-2" />
            <p>No hay vigilancias registradas</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Vigilancia</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Próximo Seguimiento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vigilancias.map((vig) => (
                <TableRow key={vig.id}>
                  <TableCell className="font-medium">{vig.vigilancia_type}</TableCell>
                  <TableCell>{vig.diagnosis || "-"}</TableCell>
                  <TableCell>{formatDate(vig.start_date)}</TableCell>
                  <TableCell>{formatDate(vig.follow_up_date)}</TableCell>
                  <TableCell>
                    {statusBadge[vig.status || "activa"]}
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
