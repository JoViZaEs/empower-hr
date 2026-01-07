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
import { format, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { Shirt, Loader2, FileX } from "lucide-react";

interface EmpleadoDotacionProps {
  employeeId: string;
}

export function EmpleadoDotacion({ employeeId }: EmpleadoDotacionProps) {
  const { data: dotacion, isLoading } = useQuery({
    queryKey: ["employee-dotacion", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dotacion")
        .select("*")
        .eq("employee_id", employeeId)
        .order("delivery_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "d MMM yyyy", { locale: es });
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return <Badge variant="outline">Sin vencimiento</Badge>;
    const isExpired = isPast(new Date(expiryDate));
    if (isExpired) {
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Vencido</Badge>;
    }
    return <Badge className="bg-success/10 text-success border-success/20">Vigente</Badge>;
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
          <Shirt className="h-5 w-5 text-primary" />
          Historial de Dotación
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!dotacion || dotacion.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileX className="h-12 w-12 mb-2" />
            <p>No hay dotación registrada</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Elemento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Talla</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Fecha Entrega</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dotacion.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item_name}</TableCell>
                  <TableCell>{item.item_type || "-"}</TableCell>
                  <TableCell>{item.size || "-"}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatDate(item.delivery_date)}</TableCell>
                  <TableCell>{formatDate(item.expiry_date)}</TableCell>
                  <TableCell>{getExpiryStatus(item.expiry_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
